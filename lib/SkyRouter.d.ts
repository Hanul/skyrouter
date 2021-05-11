import View, { ViewParams } from "./View";
declare type ViewType = new (...args: any[]) => View;
declare class SkyRouter {
    private routes;
    private openingViews;
    private match;
    constructor();
    check(preParams?: ViewParams): void;
    route(patterns: string | string[], viewType: ViewType, excludes?: string[]): void;
    go(uri: string, params?: ViewParams): void;
    goNoHistory(uri: string, params?: ViewParams): void;
    waitAndGo(uri: string, params?: ViewParams): void;
}
declare const _default: SkyRouter;
export default _default;
//# sourceMappingURL=SkyRouter.d.ts.map