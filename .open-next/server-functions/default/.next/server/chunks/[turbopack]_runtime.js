const RUNTIME_PUBLIC_PATH = "server/chunks/[turbopack]_runtime.js";
const RELATIVE_ROOT_PATH = "..";
const ASSET_PREFIX = "/";
const WORKER_FORWARDED_GLOBALS = ["NEXT_DEPLOYMENT_ID","NEXT_CLIENT_ASSET_SUFFIX"];
// Apply forwarded globals from workerData if running in a worker thread
if (typeof require !== 'undefined') {
    try {
        const { workerData } = require('worker_threads');
        if (workerData?.__turbopack_globals__) {
            Object.assign(globalThis, workerData.__turbopack_globals__);
            // Remove internal data so it's not visible to user code
            delete workerData.__turbopack_globals__;
        }
    } catch (_) {
        // Not in a worker thread context, ignore
    }
}
/**
 * This file contains runtime types and functions that are shared between all
 * TurboPack ECMAScript runtimes.
 *
 * It will be prepended to the runtime code of each runtime.
 */ /* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-types.d.ts" />
/**
 * Describes why a module was instantiated.
 * Shared between browser and Node.js runtimes.
 */ var SourceType = /*#__PURE__*/ function(SourceType) {
    /**
   * The module was instantiated because it was included in an evaluated chunk's
   * runtime.
   * SourceData is a ChunkPath.
   */ SourceType[SourceType["Runtime"] = 0] = "Runtime";
    /**
   * The module was instantiated because a parent module imported it.
   * SourceData is a ModuleId.
   */ SourceType[SourceType["Parent"] = 1] = "Parent";
    /**
   * The module was instantiated because it was included in a chunk's hot module
   * update.
   * SourceData is an array of ModuleIds or undefined.
   */ SourceType[SourceType["Update"] = 2] = "Update";
    return SourceType;
}(SourceType || {});
/**
 * Flag indicating which module object type to create when a module is merged. Set to `true`
 * by each runtime that uses ModuleWithDirection (browser dev-base.ts, nodejs dev-base.ts,
 * nodejs build-base.ts). Browser production (build-base.ts) leaves it as `false` since it
 * uses plain Module objects.
 */ let createModuleWithDirectionFlag = false;
const REEXPORTED_OBJECTS = new WeakMap();
/**
 * Constructs the `__turbopack_context__` object for a module.
 */ function Context(module, exports) {
    this.m = module;
    // We need to store this here instead of accessing it from the module object to:
    // 1. Make it available to factories directly, since we rewrite `this` to
    //    `__turbopack_context__.e` in CJS modules.
    // 2. Support async modules which rewrite `module.exports` to a promise, so we
    //    can still access the original exports object from functions like
    //    `esmExport`
    // Ideally we could find a new approach for async modules and drop this property altogether.
    this.e = exports;
}
const contextPrototype = Context.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
function defineProp(obj, name, options) {
    if (!hasOwnProperty.call(obj, name)) Object.defineProperty(obj, name, options);
}
function getOverwrittenModule(moduleCache, id) {
    let module = moduleCache[id];
    if (!module) {
        if (createModuleWithDirectionFlag) {
            // set in development modes for hmr support
            module = createModuleWithDirection(id);
        } else {
            module = createModuleObject(id);
        }
        moduleCache[id] = module;
    }
    return module;
}
/**
 * Creates the module object. Only done here to ensure all module objects have the same shape.
 */ function createModuleObject(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined
    };
}
function createModuleWithDirection(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined,
        parents: [],
        children: []
    };
}
const BindingTag_Value = 0;
/**
 * Adds the getters to the exports object.
 */ function esm(exports, bindings) {
    defineProp(exports, '__esModule', {
        value: true
    });
    if (toStringTag) defineProp(exports, toStringTag, {
        value: 'Module'
    });
    let i = 0;
    while(i < bindings.length){
        const propName = bindings[i++];
        const tagOrFunction = bindings[i++];
        if (typeof tagOrFunction === 'number') {
            if (tagOrFunction === BindingTag_Value) {
                defineProp(exports, propName, {
                    value: bindings[i++],
                    enumerable: true,
                    writable: false
                });
            } else {
                throw new Error(`unexpected tag: ${tagOrFunction}`);
            }
        } else {
            const getterFn = tagOrFunction;
            if (typeof bindings[i] === 'function') {
                const setterFn = bindings[i++];
                defineProp(exports, propName, {
                    get: getterFn,
                    set: setterFn,
                    enumerable: true
                });
            } else {
                defineProp(exports, propName, {
                    get: getterFn,
                    enumerable: true
                });
            }
        }
    }
    Object.seal(exports);
}
/**
 * Makes the module an ESM with exports
 */ function esmExport(bindings, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    module.namespaceObject = exports;
    esm(exports, bindings);
}
contextPrototype.s = esmExport;
function ensureDynamicExports(module, exports) {
    let reexportedObjects = REEXPORTED_OBJECTS.get(module);
    if (!reexportedObjects) {
        REEXPORTED_OBJECTS.set(module, reexportedObjects = []);
        module.exports = module.namespaceObject = new Proxy(exports, {
            get (target, prop) {
                if (hasOwnProperty.call(target, prop) || prop === 'default' || prop === '__esModule') {
                    return Reflect.get(target, prop);
                }
                for (const obj of reexportedObjects){
                    const value = Reflect.get(obj, prop);
                    if (value !== undefined) return value;
                }
                return undefined;
            },
            ownKeys (target) {
                const keys = Reflect.ownKeys(target);
                for (const obj of reexportedObjects){
                    for (const key of Reflect.ownKeys(obj)){
                        if (key !== 'default' && !keys.includes(key)) keys.push(key);
                    }
                }
                return keys;
            }
        });
    }
    return reexportedObjects;
}
/**
 * Dynamically exports properties from an object
 */ function dynamicExport(object, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    const reexportedObjects = ensureDynamicExports(module, exports);
    if (typeof object === 'object' && object !== null) {
        reexportedObjects.push(object);
    }
}
contextPrototype.j = dynamicExport;
function exportValue(value, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = value;
}
contextPrototype.v = exportValue;
function exportNamespace(namespace, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = module.namespaceObject = namespace;
}
contextPrototype.n = exportNamespace;
function createGetter(obj, key) {
    return ()=>obj[key];
}
/**
 * @returns prototype of the object
 */ const getProto = Object.getPrototypeOf ? (obj)=>Object.getPrototypeOf(obj) : (obj)=>obj.__proto__;
/** Prototypes that are not expanded for exports */ const LEAF_PROTOTYPES = [
    null,
    getProto({}),
    getProto([]),
    getProto(getProto)
];
/**
 * @param raw
 * @param ns
 * @param allowExportDefault
 *   * `false`: will have the raw module as default export
 *   * `true`: will have the default property as default export
 */ function interopEsm(raw, ns, allowExportDefault) {
    const bindings = [];
    let defaultLocation = -1;
    for(let current = raw; (typeof current === 'object' || typeof current === 'function') && !LEAF_PROTOTYPES.includes(current); current = getProto(current)){
        for (const key of Object.getOwnPropertyNames(current)){
            bindings.push(key, createGetter(raw, key));
            if (defaultLocation === -1 && key === 'default') {
                defaultLocation = bindings.length - 1;
            }
        }
    }
    // this is not really correct
    // we should set the `default` getter if the imported module is a `.cjs file`
    if (!(allowExportDefault && defaultLocation >= 0)) {
        // Replace the binding with one for the namespace itself in order to preserve iteration order.
        if (defaultLocation >= 0) {
            // Replace the getter with the value
            bindings.splice(defaultLocation, 1, BindingTag_Value, raw);
        } else {
            bindings.push('default', BindingTag_Value, raw);
        }
    }
    esm(ns, bindings);
    return ns;
}
function createNS(raw) {
    if (typeof raw === 'function') {
        return function(...args) {
            return raw.apply(this, args);
        };
    } else {
        return Object.create(null);
    }
}
function esmImport(id) {
    const module = getOrInstantiateModuleFromParent(id, this.m);
    // any ES module has to have `module.namespaceObject` defined.
    if (module.namespaceObject) return module.namespaceObject;
    // only ESM can be an async module, so we don't need to worry about exports being a promise here.
    const raw = module.exports;
    return module.namespaceObject = interopEsm(raw, createNS(raw), raw && raw.__esModule);
}
contextPrototype.i = esmImport;
function asyncLoader(moduleId) {
    const loader = this.r(moduleId);
    return loader(esmImport.bind(this));
}
contextPrototype.A = asyncLoader;
// Add a simple runtime require so that environments without one can still pass
// `typeof require` CommonJS checks so that exports are correctly registered.
const runtimeRequire = // @ts-ignore
typeof require === 'function' ? require : function require1() {
    throw new Error('Unexpected use of runtime require');
};
contextPrototype.t = runtimeRequire;
function commonJsRequire(id) {
    return getOrInstantiateModuleFromParent(id, this.m).exports;
}
contextPrototype.r = commonJsRequire;
/**
 * Remove fragments and query parameters since they are never part of the context map keys
 *
 * This matches how we parse patterns at resolving time.  Arguably we should only do this for
 * strings passed to `import` but the resolve does it for `import` and `require` and so we do
 * here as well.
 */ function parseRequest(request) {
    // Per the URI spec fragments can contain `?` characters, so we should trim it off first
    // https://datatracker.ietf.org/doc/html/rfc3986#section-3.5
    const hashIndex = request.indexOf('#');
    if (hashIndex !== -1) {
        request = request.substring(0, hashIndex);
    }
    const queryIndex = request.indexOf('?');
    if (queryIndex !== -1) {
        request = request.substring(0, queryIndex);
    }
    return request;
}
/**
 * `require.context` and require/import expression runtime.
 */ function moduleContext(map) {
    function moduleContext(id) {
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].module();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    }
    moduleContext.keys = ()=>{
        return Object.keys(map);
    };
    moduleContext.resolve = (id)=>{
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].id();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    };
    moduleContext.import = async (id)=>{
        return await moduleContext(id);
    };
    return moduleContext;
}
contextPrototype.f = moduleContext;
/**
 * Returns the path of a chunk defined by its data.
 */ function getChunkPath(chunkData) {
    return typeof chunkData === 'string' ? chunkData : chunkData.path;
}
function isPromise(maybePromise) {
    return maybePromise != null && typeof maybePromise === 'object' && 'then' in maybePromise && typeof maybePromise.then === 'function';
}
function isAsyncModuleExt(obj) {
    return turbopackQueues in obj;
}
function createPromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        reject = rej;
        resolve = res;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
// Load the CompressedmoduleFactories of a chunk into the `moduleFactories` Map.
// The CompressedModuleFactories format is
// - 1 or more module ids
// - a module factory function
// So walking this is a little complex but the flat structure is also fast to
// traverse, we can use `typeof` operators to distinguish the two cases.
function installCompressedModuleFactories(chunkModules, offset, moduleFactories, newModuleId) {
    let i = offset;
    while(i < chunkModules.length){
        let end = i + 1;
        // Find our factory function
        while(end < chunkModules.length && typeof chunkModules[end] !== 'function'){
            end++;
        }
        if (end === chunkModules.length) {
            throw new Error('malformed chunk format, expected a factory function');
        }
        // Install the factory for each module ID that doesn't already have one.
        // When some IDs in this group already have a factory, reuse that existing
        // group factory for the missing IDs to keep all IDs in the group consistent.
        // Otherwise, install the factory from this chunk.
        const moduleFactoryFn = chunkModules[end];
        let existingGroupFactory = undefined;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            const existingFactory = moduleFactories.get(id);
            if (existingFactory) {
                existingGroupFactory = existingFactory;
                break;
            }
        }
        const factoryToInstall = existingGroupFactory ?? moduleFactoryFn;
        let didInstallFactory = false;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            if (!moduleFactories.has(id)) {
                if (!didInstallFactory) {
                    if (factoryToInstall === moduleFactoryFn) {
                        applyModuleFactoryName(moduleFactoryFn);
                    }
                    didInstallFactory = true;
                }
                moduleFactories.set(id, factoryToInstall);
                newModuleId?.(id);
            }
        }
        i = end + 1; // end is pointing at the last factory advance to the next id or the end of the array.
    }
}
// everything below is adapted from webpack
// https://github.com/webpack/webpack/blob/6be4065ade1e252c1d8dcba4af0f43e32af1bdc1/lib/runtime/AsyncModuleRuntimeModule.js#L13
const turbopackQueues = Symbol('turbopack queues');
const turbopackExports = Symbol('turbopack exports');
const turbopackError = Symbol('turbopack error');
function resolveQueue(queue) {
    if (queue && queue.status !== 1) {
        queue.status = 1;
        queue.forEach((fn)=>fn.queueCount--);
        queue.forEach((fn)=>fn.queueCount-- ? fn.queueCount++ : fn());
    }
}
function wrapDeps(deps) {
    return deps.map((dep)=>{
        if (dep !== null && typeof dep === 'object') {
            if (isAsyncModuleExt(dep)) return dep;
            if (isPromise(dep)) {
                const queue = Object.assign([], {
                    status: 0
                });
                const obj = {
                    [turbopackExports]: {},
                    [turbopackQueues]: (fn)=>fn(queue)
                };
                dep.then((res)=>{
                    obj[turbopackExports] = res;
                    resolveQueue(queue);
                }, (err)=>{
                    obj[turbopackError] = err;
                    resolveQueue(queue);
                });
                return obj;
            }
        }
        return {
            [turbopackExports]: dep,
            [turbopackQueues]: ()=>{}
        };
    });
}
function asyncModule(body, hasAwait) {
    const module = this.m;
    const queue = hasAwait ? Object.assign([], {
        status: -1
    }) : undefined;
    const depQueues = new Set();
    const { resolve, reject, promise: rawPromise } = createPromise();
    const promise = Object.assign(rawPromise, {
        [turbopackExports]: module.exports,
        [turbopackQueues]: (fn)=>{
            queue && fn(queue);
            depQueues.forEach(fn);
            promise['catch'](()=>{});
        }
    });
    const attributes = {
        get () {
            return promise;
        },
        set (v) {
            // Calling `esmExport` leads to this.
            if (v !== promise) {
                promise[turbopackExports] = v;
            }
        }
    };
    Object.defineProperty(module, 'exports', attributes);
    Object.defineProperty(module, 'namespaceObject', attributes);
    function handleAsyncDependencies(deps) {
        const currentDeps = wrapDeps(deps);
        const getResult = ()=>currentDeps.map((d)=>{
                if (d[turbopackError]) throw d[turbopackError];
                return d[turbopackExports];
            });
        const { promise, resolve } = createPromise();
        const fn = Object.assign(()=>resolve(getResult), {
            queueCount: 0
        });
        function fnQueue(q) {
            if (q !== queue && !depQueues.has(q)) {
                depQueues.add(q);
                if (q && q.status === 0) {
                    fn.queueCount++;
                    q.push(fn);
                }
            }
        }
        currentDeps.map((dep)=>dep[turbopackQueues](fnQueue));
        return fn.queueCount ? promise : getResult();
    }
    function asyncResult(err) {
        if (err) {
            reject(promise[turbopackError] = err);
        } else {
            resolve(promise[turbopackExports]);
        }
        resolveQueue(queue);
    }
    body(handleAsyncDependencies, asyncResult);
    if (queue && queue.status === -1) {
        queue.status = 0;
    }
}
contextPrototype.a = asyncModule;
/**
 * A pseudo "fake" URL object to resolve to its relative path.
 *
 * When UrlRewriteBehavior is set to relative, calls to the `new URL()` will construct url without base using this
 * runtime function to generate context-agnostic urls between different rendering context, i.e ssr / client to avoid
 * hydration mismatch.
 *
 * This is based on webpack's existing implementation:
 * https://github.com/webpack/webpack/blob/87660921808566ef3b8796f8df61bd79fc026108/lib/runtime/RelativeUrlRuntimeModule.js
 */ const relativeURL = function relativeURL(inputUrl) {
    const realUrl = new URL(inputUrl, 'x:/');
    const values = {};
    for(const key in realUrl)values[key] = realUrl[key];
    values.href = inputUrl;
    values.pathname = inputUrl.replace(/[?#].*/, '');
    values.origin = values.protocol = '';
    values.toString = values.toJSON = (..._args)=>inputUrl;
    for(const key in values)Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        value: values[key]
    });
};
relativeURL.prototype = URL.prototype;
contextPrototype.U = relativeURL;
/**
 * Utility function to ensure all variants of an enum are handled.
 */ function invariant(never, computeMessage) {
    throw new Error(`Invariant: ${computeMessage(never)}`);
}
/**
 * Constructs an error message for when a module factory is not available.
 */ function factoryNotAvailableMessage(moduleId, sourceType, sourceData) {
    let instantiationReason;
    switch(sourceType){
        case 0:
            instantiationReason = `as a runtime entry of chunk ${sourceData}`;
            break;
        case 1:
            instantiationReason = `because it was required from module ${sourceData}`;
            break;
        case 2:
            instantiationReason = 'because of an HMR update';
            break;
        default:
            invariant(sourceType, (sourceType)=>`Unknown source type: ${sourceType}`);
    }
    return `Module ${moduleId} was instantiated ${instantiationReason}, but the module factory is not available.`;
}
/**
 * A stub function to make `require` available but non-functional in ESM.
 */ function requireStub(_moduleId) {
    throw new Error('dynamic usage of require is not supported');
}
contextPrototype.z = requireStub;
// Make `globalThis` available to the module in a way that cannot be shadowed by a local variable.
contextPrototype.g = globalThis;
function applyModuleFactoryName(factory) {
    // Give the module factory a nice name to improve stack traces.
    Object.defineProperty(factory, 'name', {
        value: 'module evaluation'
    });
}
/// <reference path="../shared/runtime/runtime-utils.ts" />
/// A 'base' utilities to support runtime can have externals.
/// Currently this is for node.js / edge runtime both.
/// If a fn requires node.js specific behavior, it should be placed in `node-external-utils` instead.
async function externalImport(id) {
    let raw;
    try {
        switch (id) {
  case "next/dist/compiled/@vercel/og/index.node.js":
    raw = await import("next/dist/compiled/@vercel/og/index.edge.js");
    break;
  default:
    raw = await import(id);
};
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (raw && raw.__esModule && raw.default && 'default' in raw.default) {
        return interopEsm(raw.default, createNS(raw), true);
    }
    return raw;
}
contextPrototype.y = externalImport;
function externalRequire(id, thunk, esm = false) {
    let raw;
    try {
        raw = thunk();
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (!esm || raw.__esModule) {
        return raw;
    }
    return interopEsm(raw, createNS(raw), true);
}
externalRequire.resolve = (id, options)=>{
    return require.resolve(id, options);
};
contextPrototype.x = externalRequire;
/* eslint-disable @typescript-eslint/no-unused-vars */ const path = require('path');
const relativePathToRuntimeRoot = path.relative(RUNTIME_PUBLIC_PATH, '.');
// Compute the relative path to the `distDir`.
const relativePathToDistRoot = path.join(relativePathToRuntimeRoot, RELATIVE_ROOT_PATH);
const RUNTIME_ROOT = path.resolve(__filename, relativePathToRuntimeRoot);
// Compute the absolute path to the root, by stripping distDir from the absolute path to this file.
const ABSOLUTE_ROOT = path.resolve(__filename, relativePathToDistRoot);
/**
 * Returns an absolute path to the given module path.
 * Module path should be relative, either path to a file or a directory.
 *
 * This fn allows to calculate an absolute path for some global static values, such as
 * `__dirname` or `import.meta.url` that Turbopack will not embeds in compile time.
 * See ImportMetaBinding::code_generation for the usage.
 */ function resolveAbsolutePath(modulePath) {
    if (modulePath) {
        return path.join(ABSOLUTE_ROOT, modulePath);
    }
    return ABSOLUTE_ROOT;
}
Context.prototype.P = resolveAbsolutePath;
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime/runtime-utils.ts" />
function readWebAssemblyAsResponse(path) {
    const { createReadStream } = require('fs');
    const { Readable } = require('stream');
    const stream = createReadStream(path);
    // @ts-ignore unfortunately there's a slight type mismatch with the stream.
    return new Response(Readable.toWeb(stream), {
        headers: {
            'content-type': 'application/wasm'
        }
    });
}
async function compileWebAssemblyFromPath(path) {
    const response = readWebAssemblyAsResponse(path);
    return await WebAssembly.compileStreaming(response);
}
async function instantiateWebAssemblyFromPath(path, importsObj) {
    const response = readWebAssemblyAsResponse(path);
    const { instance } = await WebAssembly.instantiateStreaming(response, importsObj);
    return instance.exports;
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../../shared/runtime/runtime-utils.ts" />
/// <reference path="../../shared-node/base-externals-utils.ts" />
/// <reference path="../../shared-node/node-externals-utils.ts" />
/// <reference path="../../shared-node/node-wasm-utils.ts" />
/// <reference path="./nodejs-globals.d.ts" />
/**
 * Base Node.js runtime shared between production and development.
 * Contains chunk loading, module caching, and other non-HMR functionality.
 */ process.env.TURBOPACK = '1';
const url = require('url');
const moduleFactories = new Map();
const moduleCache = Object.create(null);
/**
 * Returns an absolute path to the given module's id.
 */ function resolvePathFromModule(moduleId) {
    const exported = this.r(moduleId);
    const exportedPath = exported?.default ?? exported;
    if (typeof exportedPath !== 'string') {
        return exported;
    }
    const strippedAssetPrefix = exportedPath.slice(ASSET_PREFIX.length);
    const resolved = path.resolve(RUNTIME_ROOT, strippedAssetPrefix);
    return url.pathToFileURL(resolved).href;
}
/**
 * Exports a URL value. No suffix is added in Node.js runtime.
 */ function exportUrl(urlValue, id) {
    exportValue.call(this, urlValue, id);
}
function loadRuntimeChunk(sourcePath, chunkData) {
    if (typeof chunkData === 'string') {
        loadRuntimeChunkPath(sourcePath, chunkData);
    } else {
        loadRuntimeChunkPath(sourcePath, chunkData.path);
    }
}
const loadedChunks = new Set();
const unsupportedLoadChunk = Promise.resolve(undefined);
const loadedChunk = Promise.resolve(undefined);
const chunkCache = new Map();
function clearChunkCache() {
    chunkCache.clear();
    loadedChunks.clear();
}
function loadRuntimeChunkPath(sourcePath, chunkPath) {
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return;
    }
    if (loadedChunks.has(chunkPath)) {
        return;
    }
    try {
        const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
        const chunkModules = requireChunk(chunkPath);
        installCompressedModuleFactories(chunkModules, 0, moduleFactories);
        loadedChunks.add(chunkPath);
    } catch (cause) {
        let errorMessage = `Failed to load chunk ${chunkPath}`;
        if (sourcePath) {
            errorMessage += ` from runtime for chunk ${sourcePath}`;
        }
        const error = new Error(errorMessage, {
            cause
        });
        error.name = 'ChunkLoadError';
        throw error;
    }
}
function loadChunkAsync(chunkData) {
    const chunkPath = typeof chunkData === 'string' ? chunkData : chunkData.path;
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return unsupportedLoadChunk;
    }
    let entry = chunkCache.get(chunkPath);
    if (entry === undefined) {
        try {
            // resolve to an absolute path to simplify `require` handling
            const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
            // TODO: consider switching to `import()` to enable concurrent chunk loading and async file io
            // However this is incompatible with hot reloading (since `import` doesn't use the require cache)
            const chunkModules = requireChunk(chunkPath);
            installCompressedModuleFactories(chunkModules, 0, moduleFactories);
            entry = loadedChunk;
        } catch (cause) {
            const errorMessage = `Failed to load chunk ${chunkPath} from module ${this.m.id}`;
            const error = new Error(errorMessage, {
                cause
            });
            error.name = 'ChunkLoadError';
            // Cache the failure promise, future requests will also get this same rejection
            entry = Promise.reject(error);
        }
        chunkCache.set(chunkPath, entry);
    }
    // TODO: Return an instrumented Promise that React can use instead of relying on referential equality.
    return entry;
}
contextPrototype.l = loadChunkAsync;
function loadChunkAsyncByUrl(chunkUrl) {
    const path1 = url.fileURLToPath(new URL(chunkUrl, RUNTIME_ROOT));
    return loadChunkAsync.call(this, path1);
}
contextPrototype.L = loadChunkAsyncByUrl;
async function loadWebAssembly(chunkPath, _edgeModule, imports) {
  const mod = await loadWasmChunk(chunkPath);
  const { exports } = await WebAssembly.instantiate(mod, imports);
  return exports;
}
contextPrototype.w = loadWebAssembly;
function loadWebAssemblyModule(chunkPath, _edgeModule) {
  return loadWasmChunk(chunkPath);
}
contextPrototype.u = loadWebAssemblyModule;
/**
 * Creates a Node.js worker thread by instantiating the given WorkerConstructor
 * with the appropriate path and options, including forwarded globals.
 *
 * @param WorkerConstructor The Worker constructor from worker_threads
 * @param workerPath Path to the worker entry chunk
 * @param workerOptions options to pass to the Worker constructor (optional)
 */ function createWorker(WorkerConstructor, workerPath, workerOptions) {
    // Build the forwarded globals object
    const forwardedGlobals = {};
    for (const name of WORKER_FORWARDED_GLOBALS){
        forwardedGlobals[name] = globalThis[name];
    }
    // Merge workerData with forwarded globals
    const existingWorkerData = workerOptions?.workerData || {};
    const options = {
        ...workerOptions,
        workerData: {
            ...typeof existingWorkerData === 'object' ? existingWorkerData : {},
            __turbopack_globals__: forwardedGlobals
        }
    };
    return new WorkerConstructor(workerPath, options);
}
const regexJsUrl = /\.js(?:\?[^#]*)?(?:#.*)?$/;
/**
 * Checks if a given path/URL ends with .js, optionally followed by ?query or #fragment.
 */ function isJs(chunkUrlOrPath) {
    return regexJsUrl.test(chunkUrlOrPath);
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-base.ts" />
/**
 * Production Node.js runtime.
 * Uses ModuleWithDirection and simple module instantiation without HMR support.
 */ // moduleCache and moduleFactories are declared in runtime-base.ts
// this is read in runtime-utils.ts so it creates a module with direction for hmr
createModuleWithDirectionFlag = true;
const nodeContextPrototype = Context.prototype;
nodeContextPrototype.q = exportUrl;
nodeContextPrototype.M = moduleFactories;
// Cast moduleCache to ModuleWithDirection for production mode
nodeContextPrototype.c = moduleCache;
nodeContextPrototype.R = resolvePathFromModule;
nodeContextPrototype.b = createWorker;
nodeContextPrototype.C = clearChunkCache;
function instantiateModule(id, sourceType, sourceData) {
    const moduleFactory = moduleFactories.get(id);
    if (typeof moduleFactory !== 'function') {
        // This can happen if modules incorrectly handle HMR disposes/updates,
        // e.g. when they keep a `setTimeout` around which still executes old code
        // and contains e.g. a `require("something")` call.
        throw new Error(factoryNotAvailableMessage(id, sourceType, sourceData));
    }
    const module1 = createModuleWithDirection(id);
    const exports = module1.exports;
    moduleCache[id] = module1;
    const context = new Context(module1, exports);
    // NOTE(alexkirsz) This can fail when the module encounters a runtime error.
    try {
        moduleFactory(context, module1, exports);
    } catch (error) {
        module1.error = error;
        throw error;
    }
    ;
    module1.loaded = true;
    if (module1.namespaceObject && module1.exports !== module1.namespaceObject) {
        // in case of a circular dependency: cjs1 -> esm2 -> cjs1
        interopEsm(module1.exports, module1.namespaceObject);
    }
    return module1;
}
/**
 * Retrieves a module from the cache, or instantiate it if it is not cached.
 */ // @ts-ignore
function getOrInstantiateModuleFromParent(id, sourceModule) {
    const module1 = moduleCache[id];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateModule(id, SourceType.Parent, sourceModule.id);
}
/**
 * Instantiates a runtime module.
 */ function instantiateRuntimeModule(chunkPath, moduleId) {
    return instantiateModule(moduleId, SourceType.Runtime, chunkPath);
}
/**
 * Retrieves a module from the cache, or instantiate it as a runtime module if it is not cached.
 */ // @ts-ignore TypeScript doesn't separate this module space from the browser runtime
function getOrInstantiateRuntimeModule(chunkPath, moduleId) {
    const module1 = moduleCache[moduleId];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateRuntimeModule(chunkPath, moduleId);
}
module.exports = (sourcePath)=>({
        m: (id)=>getOrInstantiateRuntimeModule(sourcePath, id),
        c: (chunkData)=>loadRuntimeChunk(sourcePath, chunkData)
    });


//# sourceMappingURL=%5Bturbopack%5D_runtime.js.map

  function requireChunk(chunkPath) {
    switch(chunkPath) {
      case "server/chunks/ssr/[root-of-the-server]__02lr3f4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__02lr3f4._.js");
      case "server/chunks/ssr/[root-of-the-server]__0_on5p1._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0_on5p1._.js");
      case "server/chunks/ssr/[root-of-the-server]__11o4w-y._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11o4w-y._.js");
      case "server/chunks/ssr/[root-of-the-server]__1vfpvus._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1vfpvus._.js");
      case "server/chunks/ssr/[root-of-the-server]__1zopqd7._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1zopqd7._.js");
      case "server/chunks/ssr/[turbopack]_runtime.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[turbopack]_runtime.js");
      case "server/chunks/ssr/_03kytrn._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_03kytrn._.js");
      case "server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0pt47yr.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0pt47yr.js");
      case "server/chunks/ssr/node_modules_0h91jdk._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_0h91jdk._.js");
      case "server/chunks/ssr/node_modules_1do3mpc._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_1do3mpc._.js");
      case "server/chunks/ssr/node_modules_next_dist_0bw_x_7._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0bw_x_7._.js");
      case "server/chunks/ssr/node_modules_next_dist_0uboya6._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_0uboya6._.js");
      case "server/chunks/ssr/node_modules_next_dist_1enzot_._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_1enzot_._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_0p8s4lh._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_0p8s4lh._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0l_sp0x.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_unauthorized_0l_sp0x.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1unw3fb.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1unw3fb.js");
      case "server/chunks/ssr/[root-of-the-server]__1etgkcm._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1etgkcm._.js");
      case "server/chunks/ssr/_0-yy_1p._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0-yy_1p._.js");
      case "server/chunks/ssr/_03oq0pe._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_03oq0pe._.js");
      case "server/chunks/ssr/_0wicfl4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0wicfl4._.js");
      case "server/chunks/ssr/_0xd13m_._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0xd13m_._.js");
      case "server/chunks/ssr/_1h1mie8._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_1h1mie8._.js");
      case "server/chunks/ssr/_1hxp0t4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_1hxp0t4._.js");
      case "server/chunks/ssr/_1igyvts._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_1igyvts._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_explore_page_actions_1x3ap0b.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_explore_page_actions_1x3ap0b.js");
      case "server/chunks/ssr/node_modules_next_1iemwhs._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_1iemwhs._.js");
      case "server/chunks/ssr/node_modules_next_dist_1h4k0e-._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_1h4k0e-._.js");
      case "server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_0-o-goa.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_client_components_builtin_global-error_0-o-goa.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1756dps.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1756dps.js");
      case "server/chunks/ssr/[root-of-the-server]__12y8v5-._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12y8v5-._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_g_[group]_page_actions_1xwvse5.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_g_[group]_page_actions_1xwvse5.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1zald6s.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1zald6s.js");
      case "server/chunks/ssr/[root-of-the-server]__03_6-_h._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__03_6-_h._.js");
      case "server/chunks/ssr/_0k_kx9f._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0k_kx9f._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_help_page_actions_1tlbjvd.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_help_page_actions_1tlbjvd.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0xt6kt2.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0xt6kt2.js");
      case "server/chunks/ssr/[root-of-the-server]__0pgyjcy._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0pgyjcy._.js");
      case "server/chunks/ssr/_20brv1l._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_20brv1l._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_ideas_[id]_page_actions_1x1cb4m.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_ideas_[id]_page_actions_1x1cb4m.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0yncenx.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0yncenx.js");
      case "server/chunks/ssr/[root-of-the-server]__1m3zt5u._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1m3zt5u._.js");
      case "server/chunks/ssr/_0e8i2a4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0e8i2a4._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_ideas_build_page_actions_1mz8pur.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_ideas_build_page_actions_1mz8pur.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0xowsuh.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0xowsuh.js");
      case "server/chunks/ssr/[root-of-the-server]__0r5dieu._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0r5dieu._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_ideas_new_page_actions_05ntvkr.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_ideas_new_page_actions_05ntvkr.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1j490i7.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1j490i7.js");
      case "server/chunks/ssr/src_app_(site)_ideas_new_new-idea-form_tsx_0y3tlg9._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_(site)_ideas_new_new-idea-form_tsx_0y3tlg9._.js");
      case "server/chunks/ssr/[root-of-the-server]__2110_h4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__2110_h4._.js");
      case "server/chunks/ssr/_0ddq85_._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0ddq85_._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_ideas_page_actions_0-j-fq_.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_ideas_page_actions_0-j-fq_.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0khlryf.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0khlryf.js");
      case "server/chunks/ssr/[root-of-the-server]__17_tf8j._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__17_tf8j._.js");
      case "server/chunks/ssr/_20ue_09._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_20ue_09._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_lab_page_actions_1k0n-pj.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_lab_page_actions_1k0n-pj.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1vlttaz.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1vlttaz.js");
      case "server/chunks/ssr/[root-of-the-server]__0te5lkt._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0te5lkt._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_login_page_actions_1dspokv.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_login_page_actions_1dspokv.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ub74or.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ub74or.js");
      case "server/chunks/ssr/[root-of-the-server]__1z6k_jh._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1z6k_jh._.js");
      case "server/chunks/ssr/_1ipgeya._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_1ipgeya._.js");
      case "server/chunks/ssr/_1t33-34._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_1t33-34._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_me_page_actions_1_m1xik.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_me_page_actions_1_m1xik.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1oabpx0.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1oabpx0.js");
      case "server/chunks/ssr/[root-of-the-server]__0pusc4n._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0pusc4n._.js");
      case "server/chunks/ssr/_0uouzx6._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0uouzx6._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_mod_page_actions_0pe9w1a.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_mod_page_actions_0pe9w1a.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0srmwhx.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0srmwhx.js");
      case "server/chunks/ssr/[root-of-the-server]__12qh6yh._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12qh6yh._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_news_page_actions_20fgipg.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_news_page_actions_20fgipg.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1cibsyl.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1cibsyl.js");
      case "server/chunks/ssr/[root-of-the-server]__1hiznli._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1hiznli._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_notifications_page_actions_0inpqnl.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_notifications_page_actions_0inpqnl.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0079fyw.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0079fyw.js");
      case "server/chunks/ssr/[externals]_next_dist_compiled_@vercel_og_index_node_01np1ap.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_next_dist_compiled_@vercel_og_index_node_01np1ap.js");
      case "server/chunks/ssr/[root-of-the-server]__00wvst7._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__00wvst7._.js");
      case "server/chunks/ssr/[root-of-the-server]__0ed-cgt._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ed-cgt._.js");
      case "server/chunks/ssr/_091dekf._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_091dekf._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_p_[id]_comments_page_actions_19p363h.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_p_[id]_comments_page_actions_19p363h.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0l_497f.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0l_497f.js");
      case "server/chunks/1oeh_server_app_(site)_p_[id]_opengraph-image-1ll1n9_route_actions_16wi1iz.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/1oeh_server_app_(site)_p_[id]_opengraph-image-1ll1n9_route_actions_16wi1iz.js");
      case "server/chunks/[externals]_next_dist_compiled_@vercel_og_index_node_01np1ap.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[externals]_next_dist_compiled_@vercel_og_index_node_01np1ap.js");
      case "server/chunks/[root-of-the-server]__15bjnu5._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__15bjnu5._.js");
      case "server/chunks/[root-of-the-server]__1y3w5_4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1y3w5_4._.js");
      case "server/chunks/[turbopack]_runtime.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[turbopack]_runtime.js");
      case "server/chunks/node_modules_next_08s853w._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/node_modules_next_08s853w._.js");
      case "server/chunks/ssr/[root-of-the-server]__0vsljp9._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vsljp9._.js");
      case "server/chunks/ssr/_1_atd29._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_1_atd29._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_p_[id]_page_actions_0omfrzu.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_p_[id]_page_actions_0omfrzu.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0cyiwso.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0cyiwso.js");
      case "server/chunks/ssr/src_10bmiu5._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/src_10bmiu5._.js");
      case "server/chunks/ssr/src_components_0i0z_fz._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_0i0z_fz._.js");
      case "server/chunks/ssr/[root-of-the-server]__1tmzfti._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1tmzfti._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_page_actions_00xswjq.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_page_actions_00xswjq.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0p5hozc.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0p5hozc.js");
      case "server/chunks/ssr/[root-of-the-server]__03pl8v4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__03pl8v4._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_popular_page_actions_0i4j8m4.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_popular_page_actions_0i4j8m4.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0xhqmck.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0xhqmck.js");
      case "server/chunks/ssr/[root-of-the-server]__0rk-y8w._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0rk-y8w._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_s_[category]_page_actions_1skz65s.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_s_[category]_page_actions_1skz65s.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ag3ijr.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ag3ijr.js");
      case "server/chunks/ssr/[root-of-the-server]__0k0xicp._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0k0xicp._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_saves_page_actions_06jgev9.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_saves_page_actions_06jgev9.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1f17bu2.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1f17bu2.js");
      case "server/chunks/ssr/[root-of-the-server]__0q75xy1._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0q75xy1._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_search_page_actions_0um2lhe.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_search_page_actions_0um2lhe.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_12gr0w9.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_12gr0w9.js");
      case "server/chunks/ssr/[root-of-the-server]__1p9y71i._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1p9y71i._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_settings_page_actions_0o05ktm.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_settings_page_actions_0o05ktm.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ce3546.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ce3546.js");
      case "server/chunks/ssr/[root-of-the-server]__0rsgvlg._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0rsgvlg._.js");
      case "server/chunks/ssr/_16_qbpn._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_16_qbpn._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_submit_page_actions_11v7cnr.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_submit_page_actions_11v7cnr.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0ymygie.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0ymygie.js");
      case "server/chunks/ssr/[root-of-the-server]__1jltj-d._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1jltj-d._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_submit_wizard_page_actions_02zkqk4.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_submit_wizard_page_actions_02zkqk4.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1l0dlua.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1l0dlua.js");
      case "server/chunks/ssr/src_app_(site)_submit_wizard_page_tsx_12qy5au._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_(site)_submit_wizard_page_tsx_12qy5au._.js");
      case "server/chunks/ssr/[root-of-the-server]__0r2txic._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0r2txic._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_terms_page_actions_1rz7-jo.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_terms_page_actions_1rz7-jo.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0bpj6_-.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0bpj6_-.js");
      case "server/chunks/ssr/[root-of-the-server]__095992g._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__095992g._.js");
      case "server/chunks/ssr/_0nmf_p_._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0nmf_p_._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_tutorials_page_actions_0xy6ftm.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_tutorials_page_actions_0xy6ftm.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_14hnfkz.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_14hnfkz.js");
      case "server/chunks/ssr/[root-of-the-server]__0hnm4q9._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0hnm4q9._.js");
      case "server/chunks/ssr/_0z0b8ng._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0z0b8ng._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_u_[login]_page_actions_0khopym.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_u_[login]_page_actions_0khopym.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_13mhkw1.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_13mhkw1.js");
      case "server/chunks/ssr/[root-of-the-server]__0uo__el._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0uo__el._.js");
      case "server/chunks/ssr/_0_yr7ju._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_0_yr7ju._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_updates_new_page_actions_0-qczrk.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_updates_new_page_actions_0-qczrk.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1izbxw6.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1izbxw6.js");
      case "server/chunks/ssr/[root-of-the-server]__1xqjlp3._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1xqjlp3._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_updates_page_actions_0s48-ev.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_updates_page_actions_0s48-ev.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_20e4fg1.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_20e4fg1.js");
      case "server/chunks/ssr/[root-of-the-server]__0vmwrka._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vmwrka._.js");
      case "server/chunks/ssr/_088zedu._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_088zedu._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_wire_[id]_page_actions_0wm6atv.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_wire_[id]_page_actions_0wm6atv.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ylajgf.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_1ylajgf.js");
      case "server/chunks/ssr/[root-of-the-server]__10v_p72._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__10v_p72._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_wire_new_page_actions_0n-30v1.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_wire_new_page_actions_0n-30v1.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0ss7bqi.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0ss7bqi.js");
      case "server/chunks/ssr/src_app_(site)_wire_new_new-post-form_tsx_0kddvcg._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_(site)_wire_new_new-post-form_tsx_0kddvcg._.js");
      case "server/chunks/ssr/[root-of-the-server]__0r61be5._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0r61be5._.js");
      case "server/chunks/ssr/_next-internal_server_app_(site)_wire_page_actions_1j3ksxq.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_(site)_wire_page_actions_1j3ksxq.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_13fu6yx.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_13fu6yx.js");
      case "server/chunks/ssr/[root-of-the-server]__1pbtis0._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1pbtis0._.js");
      case "server/chunks/ssr/[root-of-the-server]__1z2gskm._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1z2gskm._.js");
      case "server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0zi5s8-.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0zi5s8-.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_06zp_1r.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_06zp_1r.js");
      case "server/chunks/[root-of-the-server]__1_r-xr-._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1_r-xr-._.js");
      case "server/chunks/_0htkyro._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_0htkyro._.js");
      case "server/chunks/_next-internal_server_app_api_auth_accept-terms_route_actions_07gm9mj.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_auth_accept-terms_route_actions_07gm9mj.js");
      case "server/chunks/[root-of-the-server]__0smejwh._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0smejwh._.js");
      case "server/chunks/_next-internal_server_app_api_auth_callback_route_actions_0v1dckr.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_auth_callback_route_actions_0v1dckr.js");
      case "server/chunks/[root-of-the-server]__0zynohf._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0zynohf._.js");
      case "server/chunks/_next-internal_server_app_api_auth_login_route_actions_1ox7zi0.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_auth_login_route_actions_1ox7zi0.js");
      case "server/chunks/[root-of-the-server]__1-_0vqo._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1-_0vqo._.js");
      case "server/chunks/_next-internal_server_app_api_auth_logout_route_actions_0regwyr.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_auth_logout_route_actions_0regwyr.js");
      case "server/chunks/[root-of-the-server]__1hcwojw._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1hcwojw._.js");
      case "server/chunks/_next-internal_server_app_api_blocks_route_actions_1tutolh.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_blocks_route_actions_1tutolh.js");
      case "server/chunks/[root-of-the-server]__073q3ra._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__073q3ra._.js");
      case "server/chunks/_next-internal_server_app_api_claim_route_actions_0il9qnm.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_claim_route_actions_0il9qnm.js");
      case "server/chunks/[root-of-the-server]__17h90il._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__17h90il._.js");
      case "server/chunks/_next-internal_server_app_api_comments_route_actions_1uct9re.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_comments_route_actions_1uct9re.js");
      case "server/chunks/[root-of-the-server]__0lr5hy1._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0lr5hy1._.js");
      case "server/chunks/_next-internal_server_app_api_cron_[job]_route_actions_08kr55a.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_cron_[job]_route_actions_08kr55a.js");
      case "server/chunks/node_modules_next_dist_esm_build_templates_app-route_1kkywe1.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_1kkywe1.js");
      case "server/chunks/[root-of-the-server]__0igdzn7._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0igdzn7._.js");
      case "server/chunks/_next-internal_server_app_api_detect_route_actions_1btx7sl.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_detect_route_actions_1btx7sl.js");
      case "server/chunks/[root-of-the-server]__1fgxf-q._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1fgxf-q._.js");
      case "server/chunks/_next-internal_server_app_api_follows_route_actions_1cm6-cq.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_follows_route_actions_1cm6-cq.js");
      case "server/chunks/[root-of-the-server]__1ii_rx-._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1ii_rx-._.js");
      case "server/chunks/_next-internal_server_app_api_help_route_actions_1d42vkm.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_help_route_actions_1d42vkm.js");
      case "server/chunks/[root-of-the-server]__0vo6ze0._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0vo6ze0._.js");
      case "server/chunks/_next-internal_server_app_api_ideas_route_actions_20irf13.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_ideas_route_actions_20irf13.js");
      case "server/chunks/[root-of-the-server]__02ndv81._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__02ndv81._.js");
      case "server/chunks/_next-internal_server_app_api_ideas_vote_route_actions_0xc5ud2.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_ideas_vote_route_actions_0xc5ud2.js");
      case "server/chunks/[root-of-the-server]__1a1kn8j._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1a1kn8j._.js");
      case "server/chunks/_next-internal_server_app_api_images_[___key]_route_actions_12-uw08.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_images_[___key]_route_actions_12-uw08.js");
      case "server/chunks/[root-of-the-server]__02o-zcy._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__02o-zcy._.js");
      case "server/chunks/_next-internal_server_app_api_lab-preview_route_actions_0u072-u.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_lab-preview_route_actions_0u072-u.js");
      case "server/chunks/[root-of-the-server]__1rm4p9l._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1rm4p9l._.js");
      case "server/chunks/_next-internal_server_app_api_likes_route_actions_0r3q5nl.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_likes_route_actions_0r3q5nl.js");
      case "server/chunks/[root-of-the-server]__1itxtkb._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1itxtkb._.js");
      case "server/chunks/_next-internal_server_app_api_lineage-confirm_route_actions_11qbze-.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_lineage-confirm_route_actions_11qbze-.js");
      case "server/chunks/[root-of-the-server]__0c_qswc._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0c_qswc._.js");
      case "server/chunks/_next-internal_server_app_api_mod_route_actions_1y_ml8t.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_mod_route_actions_1y_ml8t.js");
      case "server/chunks/[root-of-the-server]__1e8qcfn._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1e8qcfn._.js");
      case "server/chunks/_next-internal_server_app_api_post-react_route_actions_1053t_c.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_post-react_route_actions_1053t_c.js");
      case "server/chunks/[root-of-the-server]__1zop-87._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1zop-87._.js");
      case "server/chunks/_next-internal_server_app_api_posts_manage_route_actions_0dfbu_x.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_posts_manage_route_actions_0dfbu_x.js");
      case "server/chunks/[root-of-the-server]__1fgvtro._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1fgvtro._.js");
      case "server/chunks/_next-internal_server_app_api_posts_route_actions_0vssbav.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_posts_route_actions_0vssbav.js");
      case "server/chunks/[root-of-the-server]__0gt0d3k._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0gt0d3k._.js");
      case "server/chunks/_next-internal_server_app_api_project-comments_manage_route_actions_0_ftrrp.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_project-comments_manage_route_actions_0_ftrrp.js");
      case "server/chunks/[root-of-the-server]__0s-ke9l._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0s-ke9l._.js");
      case "server/chunks/_next-internal_server_app_api_project-comments_route_actions_180pmnu.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_project-comments_route_actions_180pmnu.js");
      case "server/chunks/[root-of-the-server]__1apx0tl._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1apx0tl._.js");
      case "server/chunks/_next-internal_server_app_api_project-updates_route_actions_0eydvi-.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_project-updates_route_actions_0eydvi-.js");
      case "server/chunks/[root-of-the-server]__1-fwau4._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1-fwau4._.js");
      case "server/chunks/_next-internal_server_app_api_projects_manage_route_actions_1y4p1yk.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_projects_manage_route_actions_1y4p1yk.js");
      case "server/chunks/[root-of-the-server]__0nzcf66._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0nzcf66._.js");
      case "server/chunks/_18l0pel._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_18l0pel._.js");
      case "server/chunks/_next-internal_server_app_api_projects_route_actions_0h5ne2f.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_projects_route_actions_0h5ne2f.js");
      case "server/chunks/[root-of-the-server]__1jaqu8n._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1jaqu8n._.js");
      case "server/chunks/_next-internal_server_app_api_readme_route_actions_1lk9izf.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_readme_route_actions_1lk9izf.js");
      case "server/chunks/[root-of-the-server]__1y87mvu._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1y87mvu._.js");
      case "server/chunks/_next-internal_server_app_api_reports_route_actions_1tb2qeh.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_reports_route_actions_1tb2qeh.js");
      case "server/chunks/[root-of-the-server]__1x0nbil._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1x0nbil._.js");
      case "server/chunks/_next-internal_server_app_api_saves_route_actions_1fpts7i.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_saves_route_actions_1fpts7i.js");
      case "server/chunks/[root-of-the-server]__1jwdwrg._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1jwdwrg._.js");
      case "server/chunks/_next-internal_server_app_api_smoke-cleanup_route_actions_1mlb-dc.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_smoke-cleanup_route_actions_1mlb-dc.js");
      case "server/chunks/[root-of-the-server]__1gifovb._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1gifovb._.js");
      case "server/chunks/_next-internal_server_app_api_smoke-target_route_actions_0bs-pc7.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_smoke-target_route_actions_0bs-pc7.js");
      case "server/chunks/[root-of-the-server]__0xk1n-f._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0xk1n-f._.js");
      case "server/chunks/_next-internal_server_app_api_snapshot_route_actions_1hk-is9.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_snapshot_route_actions_1hk-is9.js");
      case "server/chunks/[root-of-the-server]__20-xda-._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__20-xda-._.js");
      case "server/chunks/_next-internal_server_app_api_sync-forks_route_actions_0xvbvbp.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_sync-forks_route_actions_0xvbvbp.js");
      case "server/chunks/[root-of-the-server]__1q-_yep._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1q-_yep._.js");
      case "server/chunks/_next-internal_server_app_api_updates_route_actions_162_viw.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_updates_route_actions_162_viw.js");
      case "server/chunks/[root-of-the-server]__0akqpwy._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0akqpwy._.js");
      case "server/chunks/_next-internal_server_app_api_updates_seen_route_actions_1v11c_e.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_updates_seen_route_actions_1v11c_e.js");
      case "server/chunks/[root-of-the-server]__1qoexmu._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1qoexmu._.js");
      case "server/chunks/_next-internal_server_app_api_upload_route_actions_1yybo5l.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_upload_route_actions_1yybo5l.js");
      case "server/chunks/[root-of-the-server]__1cpjg20._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1cpjg20._.js");
      case "server/chunks/_next-internal_server_app_api_waitlist_route_actions_1f_7jl_.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_waitlist_route_actions_1f_7jl_.js");
      case "server/chunks/[root-of-the-server]__04mwluv._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__04mwluv._.js");
      case "server/chunks/_next-internal_server_app_api_whoami_route_actions_0a8agha.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_whoami_route_actions_0a8agha.js");
      case "server/chunks/[root-of-the-server]__1blekdw._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1blekdw._.js");
      case "server/chunks/_next-internal_server_app_apple-icon_png_route_actions_0jcl8au.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_apple-icon_png_route_actions_0jcl8au.js");
      case "server/chunks/ssr/[root-of-the-server]__1chpmwl._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__1chpmwl._.js");
      case "server/chunks/ssr/_next-internal_server_app_coming-soon_page_actions_107800j.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_coming-soon_page_actions_107800j.js");
      case "server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0wuae9y.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules_next_dist_esm_build_templates_app-page_0wuae9y.js");
      case "server/chunks/ssr/src_app_coming-soon_waitlist-form_tsx_18mb5fp._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_coming-soon_waitlist-form_tsx_18mb5fp._.js");
      case "server/chunks/[externals]_next_dist_0iuj5m_._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[externals]_next_dist_0iuj5m_._.js");
      case "server/chunks/_next-internal_server_app_favicon_ico_route_actions_0g2jjls.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_favicon_ico_route_actions_0g2jjls.js");
      case "server/chunks/node_modules_next_dist_esm_build_templates_app-route_12f2k_b.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/node_modules_next_dist_esm_build_templates_app-route_12f2k_b.js");
      case "server/chunks/[root-of-the-server]__13w-y9n._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__13w-y9n._.js");
      case "server/chunks/_next-internal_server_app_icon_png_route_actions_1-lsc8h.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_icon_png_route_actions_1-lsc8h.js");
      case "server/chunks/[root-of-the-server]__1qigcrz._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__1qigcrz._.js");
      case "server/chunks/_next-internal_server_app_robots_txt_route_actions_15vc_89.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_robots_txt_route_actions_15vc_89.js");
      case "server/chunks/[root-of-the-server]__16ycjro._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__16ycjro._.js");
      case "server/chunks/_next-internal_server_app_sitemap_xml_route_actions_05l5km9.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_sitemap_xml_route_actions_05l5km9.js");
      case "server/chunks/[root-of-the-server]__0-fnhug._.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__0-fnhug._.js");
      case "server/chunks/_next-internal_server_app_tutorial-template_md_route_actions_03dh0cn.js": return require("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_tutorial-template_md_route_actions_03dh0cn.js");
      default:
        throw new Error(`Not found ${chunkPath}`);
    }
  }


  async function loadWasmChunk(chunkPath) {
    switch (chunkPath) {
      case "/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/node_modules/next/dist/compiled/@vercel/og/resvg.wasm": return (await import("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/node_modules/next/dist/compiled/@vercel/og/resvg.wasm")).default;
      case "/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/node_modules/next/dist/compiled/@vercel/og/yoga.wasm": return (await import("/Users/jacob/Documents/ProjectOS/.open-next/server-functions/default/node_modules/next/dist/compiled/@vercel/og/yoga.wasm")).default;
      default:
        throw new Error(`Unknown wasm chunk: ${chunkPath}`);
    }
  }
