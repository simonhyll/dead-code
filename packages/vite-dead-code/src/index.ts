import { parse } from '@vue/compiler-sfc';
import { parse as babelParse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { VitePluginOptions } from './types.js'
import { Plugin } from 'vite'
import { ReplaceValue } from './types.js';

export * from './types.js'

const defaultOptions: VitePluginOptions = {
    replaceValues: {},
    stripConsole: false,
    stripConsoleLevel: 'off'
}

const logLevels = ['log', 'info', 'warn', 'error']

function replaceIdentifierWithBoolean(node: any, replaceValues: ReplaceValue) {
    if (t.isIdentifier(node)) {
        if (replaceValues.hasOwnProperty(node.name)) {
            return t.booleanLiteral(replaceValues[node.name]);
        }
        return node;
    }

    if (t.isLogicalExpression(node)) {
        node.left = replaceIdentifierWithBoolean(node.left, replaceValues);
        node.right = replaceIdentifierWithBoolean(node.right, replaceValues);
    }

    if (t.isUnaryExpression(node)) {
        node.argument = replaceIdentifierWithBoolean(node.argument, replaceValues);
    }

    return node;
}

export function deadCode(userOptions: Partial<VitePluginOptions> = {}): Plugin {
    const pluginOptions: VitePluginOptions = { ...defaultOptions, ...userOptions }
    return {
        name: 'vite-plugin-dead-code', // required, will be shown in warnings and errors
        async load(id: string) {
            return null
        },
        async transform(code: string, id: string) {
            const isVue = id.endsWith('.vue')
            if (!id.endsWith('.js') && !id.endsWith('.mjs') && !isVue) {
                return null;
            }

            try {
                const component = isVue ? parse(code) : null;
                const scriptContent = isVue && component ? component.descriptor.source || '' : code;
                const replaceValues = pluginOptions.replaceValues;

                // First Traverse - Replace replaceValues with their boolean values in the code.
                let ast = babelParse(scriptContent, { sourceType: 'module', plugins: ['jsx', 'typescript'] }); // parse the code into an AST
                traverse(ast, {
                    CallExpression(path) {
                        if (pluginOptions.stripConsole) {
                            if (
                                t.isMemberExpression(path.node.callee) &&
                                t.isIdentifier(path.node.callee.object, { name: 'console' })
                            ) {
                                path.remove();
                            }
                        } else if (pluginOptions.stripConsoleLevel !== 'off') {
                            let lastLevel = false
                            for (let i = 0; i < logLevels.length; i++) {
                                const level = logLevels[i]
                                if (level === pluginOptions.stripConsoleLevel) lastLevel = true
                                if (
                                    t.isMemberExpression(path.node.callee) &&
                                    t.isIdentifier(path.node.callee.object, { name: 'console' }) &&
                                    t.isIdentifier(path.node.callee.property, { name: level })
                                ) {
                                    path.remove();
                                    break;
                                }
                                if (lastLevel) {
                                    break;
                                }
                            }
                        }
                    },
                    Identifier(path) {
                        if (replaceValues.hasOwnProperty(path.node.name)) {
                            if (t.isIfStatement(path.parentPath.node) || t.isWhileStatement(path.parentPath.node) || t.isConditionalExpression(path.parentPath.node) || (t.isUnaryExpression(path.parentPath.node) && path.parentPath.node.operator === '!')) {
                                path.replaceWith(t.booleanLiteral(replaceValues[path.node.name]));
                            }
                        }
                    },
                    UnaryExpression(path) {
                        path.node.argument = replaceIdentifierWithBoolean(path.node.argument, replaceValues);
                    },
                    LogicalExpression(path) {
                        path.node.left = replaceIdentifierWithBoolean(path.node.left, replaceValues);
                        path.node.right = replaceIdentifierWithBoolean(path.node.right, replaceValues);
                    }
                });
                let { code: replacedCode } = generate(ast);

                ast = babelParse(replacedCode, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
                const isPureBooleanExpression = (node: t.Node): boolean => {
                    if (t.isBooleanLiteral(node)) {
                        return true;
                    } else if (t.isLogicalExpression(node)) {
                        return isPureBooleanExpression(node.left) && isPureBooleanExpression(node.right);
                    } else if (t.isUnaryExpression(node)) {
                        return t.isBooleanLiteral(node.argument)
                    }
                    return false;
                };
                const evaluateBooleanExpression = (node: t.Node): boolean | null => {
                    if (t.isBooleanLiteral(node)) {
                        return node.value;
                    } else if (t.isLogicalExpression(node)) {
                        const left = evaluateBooleanExpression(node.left);
                        const right = evaluateBooleanExpression(node.right);
                        if (left === null || right === null) return null;
                        if (node.operator === '&&') {
                            return left && right;
                        } else if (node.operator === '||') {
                            return left || right;
                        }
                    } else if (t.isUnaryExpression(node) && node.operator === '!' && t.isBooleanLiteral(node.argument)) {
                        return !node.argument.value;
                    }
                    return null;
                };

                traverse(ast, {
                    IfStatement(path) {
                        const test = path.node.test;
                        if (!isPureBooleanExpression(test)) {
                            return;
                        }
                        const value = evaluateBooleanExpression(test);
                        if (value === null) return; // if the evaluation fails, do not modify the IfStatement.
                        if (value) {
                            path.replaceWith(path.node.consequent);
                        } else {
                            if (path.node.alternate) {
                                path.replaceWith(path.node.alternate);
                            } else {
                                path.remove();
                            }
                        }
                    }

                })
                const { code: transformedCode } = generate(ast);
                return transformedCode
            } catch (e) {
                console.error(id, e)
            }

            return null;
        }
    }
}
