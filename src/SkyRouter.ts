import SkyUtil from "skyutil";
import View, { ViewParams } from "./View";

type ViewType = new (...args: any[]) => View;

class SkyRouter {

    private routes: {
        patterns: string[],
        excludes: string[],
        viewType: ViewType,
    }[] = [];

    private openingViews: View[] = [];

    private match(
        uriParts: string[],
        pattern: string,
        params?: ViewParams,
    ) {
        const patternParts = pattern.split("/");

        for (const [index, uriPart] of uriParts.entries()) {

            const patternPart = patternParts[index];

            if (patternPart === undefined) {
                return false;
            } else if (patternPart === "**") {
                return true;
            }

            // find params.
            if (uriPart !== "" && patternPart[0] === "{" && patternPart[patternPart.length - 1] === "}") {
                if (params !== undefined) {
                    params[patternPart.substring(1, patternPart.length - 1)] = uriPart;
                }
            } else if (patternPart !== "*" && patternPart !== uriPart) {
                return false;
            }

            if (index === uriParts.length - 1 && index < patternParts.length - 1 && patternParts[patternParts.length - 1] !== "") {
                return false;
            }
        }

        return true;
    }

    constructor() {
        window.addEventListener("popstate", (event) => this.check(event.state === null ? {} : event.state));
    }

    public check(preParams?: ViewParams) {

        const uri = decodeURIComponent(location.pathname.substring(1));
        const uriParts = uri.split("/");

        for (const { patterns, excludes, viewType } of this.routes) {
            const params: ViewParams = preParams === undefined ? {} : Object.assign({}, preParams);
            const openingView = this.openingViews.find((ov) => ov instanceof viewType);
            if (
                patterns.find((pattern) => this.match(uriParts, pattern, params)) !== undefined &&
                excludes.find((exclude) => this.match(uriParts, exclude)) === undefined
            ) {
                if (openingView === undefined) {
                    this.openingViews.push(new viewType(params, uri));
                } else {
                    openingView.changeParams(params, uri);
                }
            } else if (openingView !== undefined) {
                openingView.close();
                SkyUtil.pull(this.openingViews, openingView);
            }
        }
    }

    public route(patterns: string | string[], viewType: ViewType, excludes: string[] = []) {
        if (typeof patterns === "string") {
            patterns = [patterns];
        }
        this.routes.push({ patterns, excludes, viewType });

        const uri = decodeURIComponent(location.pathname.substring(1));
        const uriParts = uri.split("/");
        const params: ViewParams = {};
        if (
            patterns.find((pattern) => this.match(uriParts, pattern, params)) !== undefined &&
            excludes.find((exclude) => this.match(uriParts, exclude)) === undefined
        ) {
            this.openingViews.push(new viewType(params, uri));
        }
    }

    public go(uri: string, params?: ViewParams) {
        if (location.pathname !== uri) {
            history.pushState(undefined, "", uri);
            this.check(params);
        }
    }

    public goNoHistory(uri: string, params?: ViewParams) {
        if (location.pathname !== uri) {
            history.replaceState(undefined, "", uri);
            this.check(params);
        }
    }

    public waitAndGo(uri: string, params?: ViewParams) {
        setTimeout(() => this.go(uri, params));
    }
}

export default new SkyRouter();
