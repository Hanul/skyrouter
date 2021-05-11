"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const skyutil_1 = __importDefault(require("skyutil"));
class SkyRouter {
    constructor() {
        this.routes = [];
        this.openingViews = [];
        window.addEventListener("popstate", (event) => this.check(event.state === null ? {} : event.state));
    }
    match(uriParts, pattern, params) {
        const patternParts = pattern.split("/");
        for (const [index, uriPart] of uriParts.entries()) {
            const patternPart = patternParts[index];
            if (patternPart === undefined) {
                return false;
            }
            else if (patternPart === "**") {
                return true;
            }
            if (uriPart !== "" && patternPart[0] === "{" && patternPart[patternPart.length - 1] === "}") {
                if (params !== undefined) {
                    params[patternPart.substring(1, patternPart.length - 1)] = uriPart;
                }
            }
            else if (patternPart !== "*" && patternPart !== uriPart) {
                return false;
            }
            if (index === uriParts.length - 1 && index < patternParts.length - 1 && patternParts[patternParts.length - 1] !== "") {
                return false;
            }
        }
        return true;
    }
    check(preParams) {
        const uri = decodeURIComponent(location.pathname.substring(1));
        const uriParts = uri.split("/");
        for (const { patterns, excludes, viewType } of this.routes) {
            const params = preParams === undefined ? {} : Object.assign({}, preParams);
            const openingView = this.openingViews.find((ov) => ov instanceof viewType);
            if (patterns.find((pattern) => this.match(uriParts, pattern, params)) !== undefined &&
                excludes.find((exclude) => this.match(uriParts, exclude)) === undefined) {
                if (openingView === undefined) {
                    this.openingViews.push(new viewType(params, uri));
                }
                else {
                    openingView.changeParams(params, uri);
                }
            }
            else if (openingView !== undefined) {
                openingView.close();
                skyutil_1.default.pull(this.openingViews, openingView);
            }
        }
    }
    route(patterns, viewType, excludes = []) {
        if (typeof patterns === "string") {
            patterns = [patterns];
        }
        this.routes.push({ patterns, excludes, viewType });
        const uri = decodeURIComponent(location.pathname.substring(1));
        const uriParts = uri.split("/");
        const params = {};
        if (patterns.find((pattern) => this.match(uriParts, pattern, params)) !== undefined &&
            excludes.find((exclude) => this.match(uriParts, exclude)) === undefined) {
            this.openingViews.push(new viewType(params, uri));
        }
    }
    go(uri, params) {
        if (location.pathname !== uri) {
            history.pushState(undefined, "", uri);
            this.check(params);
        }
    }
    goNoHistory(uri, params) {
        if (location.pathname !== uri) {
            history.replaceState(undefined, "", uri);
            this.check(params);
        }
    }
    waitAndGo(uri, params) {
        setTimeout(() => this.go(uri, params));
    }
}
exports.default = new SkyRouter();
//# sourceMappingURL=SkyRouter.js.map