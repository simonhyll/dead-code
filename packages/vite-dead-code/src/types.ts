export interface ReplaceValue extends Record<string, boolean> { }
export interface VitePluginOptions {
    replaceValues: ReplaceValue;
    stripConsole: boolean;
    stripConsoleLevel: string;
}
