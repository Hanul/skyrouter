export interface ViewParams {
    [name: string]: string;
}
export default interface View {
    changeParams(params: ViewParams, uri: string): void;
    close(): void;
}
//# sourceMappingURL=View.d.ts.map