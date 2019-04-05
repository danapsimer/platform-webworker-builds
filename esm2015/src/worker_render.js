/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ɵPLATFORM_WORKER_UI_ID as PLATFORM_WORKER_UI_ID } from '@angular/common';
import { ErrorHandler, Injectable, InjectionToken, Injector, NgZone, PLATFORM_ID, PLATFORM_INITIALIZER, RendererFactory2, Testability, createPlatformFactory, isDevMode, platformCore, ɵAPP_ID_RANDOM_PROVIDER as APP_ID_RANDOM_PROVIDER } from '@angular/core';
import { DOCUMENT, EVENT_MANAGER_PLUGINS, EventManager, HAMMER_GESTURE_CONFIG, HammerGestureConfig, ɵBROWSER_SANITIZATION_PROVIDERS as BROWSER_SANITIZATION_PROVIDERS, ɵBrowserDomAdapter as BrowserDomAdapter, ɵBrowserGetTestability as BrowserGetTestability, ɵDomEventsPlugin as DomEventsPlugin, ɵDomRendererFactory2 as DomRendererFactory2, ɵDomSharedStylesHost as DomSharedStylesHost, ɵHammerGesturesPlugin as HammerGesturesPlugin, ɵKeyEventsPlugin as KeyEventsPlugin, ɵSharedStylesHost as SharedStylesHost } from '@angular/platform-browser';
import { ON_WEB_WORKER } from './web_workers/shared/api';
import { ClientMessageBrokerFactory } from './web_workers/shared/client_message_broker';
import { MessageBus } from './web_workers/shared/message_bus';
import { PostMessageBus, PostMessageBusSink, PostMessageBusSource } from './web_workers/shared/post_message_bus';
import { RenderStore } from './web_workers/shared/render_store';
import { Serializer } from './web_workers/shared/serializer';
import { ServiceMessageBrokerFactory } from './web_workers/shared/service_message_broker';
import { MessageBasedRenderer2 } from './web_workers/ui/renderer';
/**
 * Wrapper class that exposes the Worker
 * and underlying {\@link MessageBus} for lower level message passing.
 *
 * \@publicApi
 */
export class WebWorkerInstance {
    /**
     * \@internal
     * @param {?} worker
     * @param {?} bus
     * @return {?}
     */
    init(worker, bus) {
        this.worker = worker;
        this.bus = bus;
    }
}
WebWorkerInstance.decorators = [
    { type: Injectable }
];
if (false) {
    /** @type {?} */
    WebWorkerInstance.prototype.worker;
    /** @type {?} */
    WebWorkerInstance.prototype.bus;
}
/**
 * \@publicApi
 * @type {?}
 */
export const WORKER_SCRIPT = new InjectionToken('WebWorkerScript');
/**
 * A multi-provider used to automatically call the `start()` method after the service is
 * created.
 *
 * \@publicApi
 * @type {?}
 */
export const WORKER_UI_STARTABLE_MESSAGING_SERVICE = new InjectionToken('WorkerRenderStartableMsgService');
/** @type {?} */
export const _WORKER_UI_PLATFORM_PROVIDERS = [
    { provide: NgZone, useFactory: createNgZone, deps: [] },
    {
        provide: MessageBasedRenderer2,
        deps: [ServiceMessageBrokerFactory, MessageBus, Serializer, RenderStore, RendererFactory2]
    },
    { provide: WORKER_UI_STARTABLE_MESSAGING_SERVICE, useExisting: MessageBasedRenderer2, multi: true },
    BROWSER_SANITIZATION_PROVIDERS,
    { provide: ErrorHandler, useFactory: _exceptionHandler, deps: [] },
    { provide: DOCUMENT, useFactory: _document, deps: [] },
    // TODO(jteplitz602): Investigate if we definitely need EVENT_MANAGER on the render thread
    // #5298
    {
        provide: EVENT_MANAGER_PLUGINS,
        useClass: DomEventsPlugin,
        deps: [DOCUMENT, NgZone],
        multi: true
    },
    { provide: EVENT_MANAGER_PLUGINS, useClass: KeyEventsPlugin, deps: [DOCUMENT], multi: true },
    {
        provide: EVENT_MANAGER_PLUGINS,
        useClass: HammerGesturesPlugin,
        deps: [DOCUMENT, HAMMER_GESTURE_CONFIG],
        multi: true
    },
    { provide: HAMMER_GESTURE_CONFIG, useClass: HammerGestureConfig, deps: [] },
    APP_ID_RANDOM_PROVIDER,
    { provide: DomRendererFactory2, deps: [EventManager, DomSharedStylesHost] },
    { provide: RendererFactory2, useExisting: DomRendererFactory2 },
    { provide: SharedStylesHost, useExisting: DomSharedStylesHost },
    {
        provide: ServiceMessageBrokerFactory,
        useClass: ServiceMessageBrokerFactory,
        deps: [MessageBus, Serializer]
    },
    {
        provide: ClientMessageBrokerFactory,
        useClass: ClientMessageBrokerFactory,
        deps: [MessageBus, Serializer]
    },
    { provide: Serializer, deps: [RenderStore] },
    { provide: ON_WEB_WORKER, useValue: false },
    { provide: RenderStore, deps: [] },
    { provide: DomSharedStylesHost, deps: [DOCUMENT] },
    { provide: Testability, deps: [NgZone] },
    { provide: EventManager, deps: [EVENT_MANAGER_PLUGINS, NgZone] },
    { provide: WebWorkerInstance, deps: [] },
    {
        provide: PLATFORM_INITIALIZER,
        useFactory: initWebWorkerRenderPlatform,
        multi: true,
        deps: [Injector]
    },
    { provide: PLATFORM_ID, useValue: PLATFORM_WORKER_UI_ID },
    { provide: MessageBus, useFactory: messageBusFactory, deps: [WebWorkerInstance] },
];
/**
 * @param {?} injector
 * @return {?}
 */
function initializeGenericWorkerRenderer(injector) {
    /** @type {?} */
    const bus = injector.get(MessageBus);
    /** @type {?} */
    const zone = injector.get(NgZone);
    bus.attachToZone(zone);
    // initialize message services after the bus has been created
    /** @type {?} */
    const services = injector.get(WORKER_UI_STARTABLE_MESSAGING_SERVICE);
    zone.runGuarded(() => { services.forEach((svc) => { svc.start(); }); });
}
/**
 * @param {?} instance
 * @return {?}
 */
function messageBusFactory(instance) {
    return instance.bus;
}
/**
 * @param {?} injector
 * @return {?}
 */
function initWebWorkerRenderPlatform(injector) {
    return () => {
        BrowserDomAdapter.makeCurrent();
        BrowserGetTestability.init();
        /** @type {?} */
        let scriptUri;
        try {
            scriptUri = injector.get(WORKER_SCRIPT);
        }
        catch (_a) {
            throw new Error('You must provide your WebWorker\'s initialization script with the WORKER_SCRIPT token');
        }
        /** @type {?} */
        const instance = injector.get(WebWorkerInstance);
        spawnWebWorker(scriptUri, instance);
        initializeGenericWorkerRenderer(injector);
    };
}
/**
 * \@publicApi
 * @type {?}
 */
export const platformWorkerUi = createPlatformFactory(platformCore, 'workerUi', _WORKER_UI_PLATFORM_PROVIDERS);
/**
 * @return {?}
 */
function _exceptionHandler() {
    return new ErrorHandler();
}
/**
 * @return {?}
 */
function _document() {
    return document;
}
/**
 * @return {?}
 */
function createNgZone() {
    return new NgZone({ enableLongStackTrace: isDevMode() });
}
/**
 * Spawns a new class and initializes the WebWorkerInstance
 * @param {?} uri
 * @param {?} instance
 * @return {?}
 */
function spawnWebWorker(uri, instance) {
    /** @type {?} */
    const webWorker = new Worker(uri);
    /** @type {?} */
    const sink = new PostMessageBusSink(webWorker);
    /** @type {?} */
    const source = new PostMessageBusSource(webWorker);
    /** @type {?} */
    const bus = new PostMessageBus(sink, source);
    instance.init(webWorker, bus);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyX3JlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL3BsYXRmb3JtLXdlYndvcmtlci9zcmMvd29ya2VyX3JlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBZSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzlGLE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxvQkFBb0IsRUFBZSxnQkFBZ0IsRUFBZ0MsV0FBVyxFQUFFLHFCQUFxQixFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsdUJBQXVCLElBQUksc0JBQXNCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDelMsT0FBTyxFQUFDLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSxZQUFZLEVBQUUscUJBQXFCLEVBQUUsbUJBQW1CLEVBQUUsK0JBQStCLElBQUksOEJBQThCLEVBQUUsa0JBQWtCLElBQUksaUJBQWlCLEVBQUUsc0JBQXNCLElBQUkscUJBQXFCLEVBQUUsZ0JBQWdCLElBQUksZUFBZSxFQUFFLG9CQUFvQixJQUFJLG1CQUFtQixFQUFFLG9CQUFvQixJQUFJLG1CQUFtQixFQUFFLHFCQUFxQixJQUFJLG9CQUFvQixFQUFFLGdCQUFnQixJQUFJLGVBQWUsRUFBRSxpQkFBaUIsSUFBSSxnQkFBZ0IsRUFBb0IsTUFBTSwyQkFBMkIsQ0FBQztBQUU5aUIsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3ZELE9BQU8sRUFBQywwQkFBMEIsRUFBQyxNQUFNLDRDQUE0QyxDQUFDO0FBQ3RGLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxrQ0FBa0MsQ0FBQztBQUM1RCxPQUFPLEVBQUMsY0FBYyxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixFQUFDLE1BQU0sdUNB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QVcsRUFBRSxRQUEyQjs7VUFDeEQsU0FBUyxHQUFXLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQzs7VUFDbkMsSUFBSSxHQUFHLElBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDOztVQUN4QyxNQUFNLEdBQUcsSUFBSSxvQkFBb0IsQ0FBQyxTQUFTLENBQUM7O1VBQzVDLEdBQUcsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDO0lBRTVDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tbW9uTW9kdWxlLCDJtVBMQVRGT1JNX1dPUktFUl9VSV9JRCBhcyBQTEFURk9STV9XT1JLRVJfVUlfSUR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0Vycm9ySGFuZGxlciwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIEluamVjdG9yLCBOZ1pvbmUsIFBMQVRGT1JNX0lELCBQTEFURk9STV9JTklUSUFMSVpFUiwgUGxhdGZvcm1SZWYsIFJlbmRlcmVyRmFjdG9yeTIsIFJvb3RSZW5kZXJlciwgU3RhdGljUHJvdmlkZXIsIFRlc3RhYmlsaXR5LCBjcmVhdGVQbGF0Zm9ybUZhY3RvcnksIGlzRGV2TW9kZSwgcGxhdGZvcm1Db3JlLCDJtUFQUF9JRF9SQU5ET01fUFJPVklERVIgYXMgQVBQX0lEX1JBTkRPTV9QUk9WSURFUn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0RPQ1VNRU5ULCBFVkVOVF9NQU5BR0VSX1BMVUdJTlMsIEV2ZW50TWFuYWdlciwgSEFNTUVSX0dFU1RVUkVfQ09ORklHLCBIYW1tZXJHZXN0dXJlQ29uZmlnLCDJtUJST1dTRVJfU0FOSVRJWkFUSU9OX1BST1ZJREVSUyBhcyBCUk9XU0VSX1NBTklUSVpBVElPTl9QUk9WSURFUlMsIMm1QnJvd3NlckRvbUFkYXB0ZXIgYXMgQnJvd3NlckRvbUFkYXB0ZXIsIMm1QnJvd3NlckdldFRlc3RhYmlsaXR5IGFzIEJyb3dzZXJHZXRUZXN0YWJpbGl0eSwgybVEb21FdmVudHNQbHVnaW4gYXMgRG9tRXZlbnRzUGx1Z2luLCDJtURvbVJlbmRlcmVyRmFjdG9yeTIgYXMgRG9tUmVuZGVyZXJGYWN0b3J5MiwgybVEb21TaGFyZWRTdHlsZXNIb3N0IGFzIERvbVNoYXJlZFN0eWxlc0hvc3QsIMm1SGFtbWVyR2VzdHVyZXNQbHVnaW4gYXMgSGFtbWVyR2VzdHVyZXNQbHVnaW4sIMm1S2V5RXZlbnRzUGx1Z2luIGFzIEtleUV2ZW50c1BsdWdpbiwgybVTaGFyZWRTdHlsZXNIb3N0IGFzIFNoYXJlZFN0eWxlc0hvc3QsIMm1Z2V0RE9NIGFzIGdldERPTX0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7T05fV0VCX1dPUktFUn0gZnJvbSAnLi93ZWJfd29ya2Vycy9zaGFyZWQvYXBpJztcbmltcG9ydCB7Q2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnl9IGZyb20gJy4vd2ViX3dvcmtlcnMvc2hhcmVkL2NsaWVudF9tZXNzYWdlX2Jyb2tlcic7XG5pbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gJy4vd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzJztcbmltcG9ydCB7UG9zdE1lc3NhZ2VCdXMsIFBvc3RNZXNzYWdlQnVzU2luaywgUG9zdE1lc3NhZ2VCdXNTb3VyY2V9IGZyb20gJy4vd2ViX3dvcmtlcnMvc2hhcmVkL3Bvc3RfbWVzc2FnZV9idXMnO1xuaW1wb3J0IHtSZW5kZXJTdG9yZX0gZnJvbSAnLi93ZWJfd29ya2Vycy9zaGFyZWQvcmVuZGVyX3N0b3JlJztcbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSAnLi93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplcic7XG5pbXBvcnQge1NlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeX0gZnJvbSAnLi93ZWJfd29ya2Vycy9zaGFyZWQvc2VydmljZV9tZXNzYWdlX2Jyb2tlcic7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFJlbmRlcmVyMn0gZnJvbSAnLi93ZWJfd29ya2Vycy91aS9yZW5kZXJlcic7XG5cblxuXG4vKipcbiAqIFdyYXBwZXIgY2xhc3MgdGhhdCBleHBvc2VzIHRoZSBXb3JrZXJcbiAqIGFuZCB1bmRlcmx5aW5nIHtAbGluayBNZXNzYWdlQnVzfSBmb3IgbG93ZXIgbGV2ZWwgbWVzc2FnZSBwYXNzaW5nLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckluc3RhbmNlIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHB1YmxpYyB3b3JrZXIgITogV29ya2VyO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHVibGljIGJ1cyAhOiBNZXNzYWdlQnVzO1xuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIGluaXQod29ya2VyOiBXb3JrZXIsIGJ1czogTWVzc2FnZUJ1cykge1xuICAgIHRoaXMud29ya2VyID0gd29ya2VyO1xuICAgIHRoaXMuYnVzID0gYnVzO1xuICB9XG59XG5cbi8qKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgV09SS0VSX1NDUklQVCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxzdHJpbmc+KCdXZWJXb3JrZXJTY3JpcHQnKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVyIHVzZWQgdG8gYXV0b21hdGljYWxseSBjYWxsIHRoZSBgc3RhcnQoKWAgbWV0aG9kIGFmdGVyIHRoZSBzZXJ2aWNlIGlzXG4gKiBjcmVhdGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IFdPUktFUl9VSV9TVEFSVEFCTEVfTUVTU0FHSU5HX1NFUlZJQ0UgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjwoe3N0YXJ0OiAoKSA9PiB2b2lkfSlbXT4oJ1dvcmtlclJlbmRlclN0YXJ0YWJsZU1zZ1NlcnZpY2UnKTtcblxuZXhwb3J0IGNvbnN0IF9XT1JLRVJfVUlfUExBVEZPUk1fUFJPVklERVJTOiBTdGF0aWNQcm92aWRlcltdID0gW1xuICB7cHJvdmlkZTogTmdab25lLCB1c2VGYWN0b3J5OiBjcmVhdGVOZ1pvbmUsIGRlcHM6IFtdfSxcbiAge1xuICAgIHByb3ZpZGU6IE1lc3NhZ2VCYXNlZFJlbmRlcmVyMixcbiAgICBkZXBzOiBbU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5LCBNZXNzYWdlQnVzLCBTZXJpYWxpemVyLCBSZW5kZXJTdG9yZSwgUmVuZGVyZXJGYWN0b3J5Ml1cbiAgfSxcbiAge3Byb3ZpZGU6IFdPUktFUl9VSV9TVEFSVEFCTEVfTUVTU0FHSU5HX1NFUlZJQ0UsIHVzZUV4aXN0aW5nOiBNZXNzYWdlQmFzZWRSZW5kZXJlcjIsIG11bHRpOiB0cnVlfSxcbiAgQlJPV1NFUl9TQU5JVElaQVRJT05fUFJPVklERVJTLFxuICB7cHJvdmlkZTogRXJyb3JIYW5kbGVyLCB1c2VGYWN0b3J5OiBfZXhjZXB0aW9uSGFuZGxlciwgZGVwczogW119LFxuICB7cHJvdmlkZTogRE9DVU1FTlQsIHVzZUZhY3Rvcnk6IF9kb2N1bWVudCwgZGVwczogW119LFxuICAvLyBUT0RPKGp0ZXBsaXR6NjAyKTogSW52ZXN0aWdhdGUgaWYgd2UgZGVmaW5pdGVseSBuZWVkIEVWRU5UX01BTkFHRVIgb24gdGhlIHJlbmRlciB0aHJlYWRcbiAgLy8gIzUyOThcbiAge1xuICAgIHByb3ZpZGU6IEVWRU5UX01BTkFHRVJfUExVR0lOUyxcbiAgICB1c2VDbGFzczogRG9tRXZlbnRzUGx1Z2luLFxuICAgIGRlcHM6IFtET0NVTUVOVCwgTmdab25lXSxcbiAgICBtdWx0aTogdHJ1ZVxuICB9LFxuICB7cHJvdmlkZTogRVZFTlRfTUFOQUdFUl9QTFVHSU5TLCB1c2VDbGFzczogS2V5RXZlbnRzUGx1Z2luLCBkZXBzOiBbRE9DVU1FTlRdLCBtdWx0aTogdHJ1ZX0sXG4gIHtcbiAgICBwcm92aWRlOiBFVkVOVF9NQU5BR0VSX1BMVUdJTlMsXG4gICAgdXNlQ2xhc3M6IEhhbW1lckdlc3R1cmVzUGx1Z2luLFxuICAgIGRlcHM6IFtET0NVTUVOVCwgSEFNTUVSX0dFU1RVUkVfQ09ORklHXSxcbiAgICBtdWx0aTogdHJ1ZVxuICB9LFxuICB7cHJvdmlkZTogSEFNTUVSX0dFU1RVUkVfQ09ORklHLCB1c2VDbGFzczogSGFtbWVyR2VzdHVyZUNvbmZpZywgZGVwczogW119LFxuICBBUFBfSURfUkFORE9NX1BST1ZJREVSLFxuICB7cHJvdmlkZTogRG9tUmVuZGVyZXJGYWN0b3J5MiwgZGVwczogW0V2ZW50TWFuYWdlciwgRG9tU2hhcmVkU3R5bGVzSG9zdF19LFxuICB7cHJvdmlkZTogUmVuZGVyZXJGYWN0b3J5MiwgdXNlRXhpc3Rpbmc6IERvbVJlbmRlcmVyRmFjdG9yeTJ9LFxuICB7cHJvdmlkZTogU2hhcmVkU3R5bGVzSG9zdCwgdXNlRXhpc3Rpbmc6IERvbVNoYXJlZFN0eWxlc0hvc3R9LFxuICB7XG4gICAgcHJvdmlkZTogU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5LFxuICAgIHVzZUNsYXNzOiBTZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3RvcnksXG4gICAgZGVwczogW01lc3NhZ2VCdXMsIFNlcmlhbGl6ZXJdXG4gIH0sXG4gIHtcbiAgICBwcm92aWRlOiBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgICB1c2VDbGFzczogQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnksXG4gICAgZGVwczogW01lc3NhZ2VCdXMsIFNlcmlhbGl6ZXJdXG4gIH0sXG4gIHtwcm92aWRlOiBTZXJpYWxpemVyLCBkZXBzOiBbUmVuZGVyU3RvcmVdfSxcbiAge3Byb3ZpZGU6IE9OX1dFQl9XT1JLRVIsIHVzZVZhbHVlOiBmYWxzZX0sXG4gIHtwcm92aWRlOiBSZW5kZXJTdG9yZSwgZGVwczogW119LFxuICB7cHJvdmlkZTogRG9tU2hhcmVkU3R5bGVzSG9zdCwgZGVwczogW0RPQ1VNRU5UXX0sXG4gIHtwcm92aWRlOiBUZXN0YWJpbGl0eSwgZGVwczogW05nWm9uZV19LFxuICB7cHJvdmlkZTogRXZlbnRNYW5hZ2VyLCBkZXBzOiBbRVZFTlRfTUFOQUdFUl9QTFVHSU5TLCBOZ1pvbmVdfSxcbiAge3Byb3ZpZGU6IFdlYldvcmtlckluc3RhbmNlLCBkZXBzOiBbXX0sXG4gIHtcbiAgICBwcm92aWRlOiBQTEFURk9STV9JTklUSUFMSVpFUixcbiAgICB1c2VGYWN0b3J5OiBpbml0V2ViV29ya2VyUmVuZGVyUGxhdGZvcm0sXG4gICAgbXVsdGk6IHRydWUsXG4gICAgZGVwczogW0luamVjdG9yXVxuICB9LFxuICB7cHJvdmlkZTogUExBVEZPUk1fSUQsIHVzZVZhbHVlOiBQTEFURk9STV9XT1JLRVJfVUlfSUR9LFxuICB7cHJvdmlkZTogTWVzc2FnZUJ1cywgdXNlRmFjdG9yeTogbWVzc2FnZUJ1c0ZhY3RvcnksIGRlcHM6IFtXZWJXb3JrZXJJbnN0YW5jZV19LFxuXTtcblxuZnVuY3Rpb24gaW5pdGlhbGl6ZUdlbmVyaWNXb3JrZXJSZW5kZXJlcihpbmplY3RvcjogSW5qZWN0b3IpIHtcbiAgY29uc3QgYnVzID0gaW5qZWN0b3IuZ2V0KE1lc3NhZ2VCdXMpO1xuICBjb25zdCB6b25lID0gaW5qZWN0b3IuZ2V0PE5nWm9uZT4oTmdab25lKTtcbiAgYnVzLmF0dGFjaFRvWm9uZSh6b25lKTtcblxuICAvLyBpbml0aWFsaXplIG1lc3NhZ2Ugc2VydmljZXMgYWZ0ZXIgdGhlIGJ1cyBoYXMgYmVlbiBjcmVhdGVkXG4gIGNvbnN0IHNlcnZpY2VzID0gaW5qZWN0b3IuZ2V0KFdPUktFUl9VSV9TVEFSVEFCTEVfTUVTU0FHSU5HX1NFUlZJQ0UpO1xuICB6b25lLnJ1bkd1YXJkZWQoKCkgPT4geyBzZXJ2aWNlcy5mb3JFYWNoKChzdmM6IGFueSkgPT4geyBzdmMuc3RhcnQoKTsgfSk7IH0pO1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlQnVzRmFjdG9yeShpbnN0YW5jZTogV2ViV29ya2VySW5zdGFuY2UpOiBNZXNzYWdlQnVzIHtcbiAgcmV0dXJuIGluc3RhbmNlLmJ1cztcbn1cblxuZnVuY3Rpb24gaW5pdFdlYldvcmtlclJlbmRlclBsYXRmb3JtKGluamVjdG9yOiBJbmplY3Rvcik6ICgpID0+IHZvaWQge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIEJyb3dzZXJEb21BZGFwdGVyLm1ha2VDdXJyZW50KCk7XG4gICAgQnJvd3NlckdldFRlc3RhYmlsaXR5LmluaXQoKTtcbiAgICBsZXQgc2NyaXB0VXJpOiBzdHJpbmc7XG4gICAgdHJ5IHtcbiAgICAgIHNjcmlwdFVyaSA9IGluamVjdG9yLmdldChXT1JLRVJfU0NSSVBUKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnWW91IG11c3QgcHJvdmlkZSB5b3VyIFdlYldvcmtlclxcJ3MgaW5pdGlhbGl6YXRpb24gc2NyaXB0IHdpdGggdGhlIFdPUktFUl9TQ1JJUFQgdG9rZW4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBpbnN0YW5jZSA9IGluamVjdG9yLmdldChXZWJXb3JrZXJJbnN0YW5jZSk7XG4gICAgc3Bhd25XZWJXb3JrZXIoc2NyaXB0VXJpLCBpbnN0YW5jZSk7XG5cbiAgICBpbml0aWFsaXplR2VuZXJpY1dvcmtlclJlbmRlcmVyKGluamVjdG9yKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBwbGF0Zm9ybVdvcmtlclVpID1cbiAgICBjcmVhdGVQbGF0Zm9ybUZhY3RvcnkocGxhdGZvcm1Db3JlLCAnd29ya2VyVWknLCBfV09SS0VSX1VJX1BMQVRGT1JNX1BST1ZJREVSUyk7XG5cbmZ1bmN0aW9uIF9leGNlcHRpb25IYW5kbGVyKCk6IEVycm9ySGFuZGxlciB7XG4gIHJldHVybiBuZXcgRXJyb3JIYW5kbGVyKCk7XG59XG5cbmZ1bmN0aW9uIF9kb2N1bWVudCgpOiBhbnkge1xuICByZXR1cm4gZG9jdW1lbnQ7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5nWm9uZSgpOiBOZ1pvbmUge1xuICByZXR1cm4gbmV3IE5nWm9uZSh7ZW5hYmxlTG9uZ1N0YWNrVHJhY2U6IGlzRGV2TW9kZSgpfSk7XG59XG5cbi8qKlxuICogU3Bhd25zIGEgbmV3IGNsYXNzIGFuZCBpbml0aWFsaXplcyB0aGUgV2ViV29ya2VySW5zdGFuY2VcbiAqL1xuZnVuY3Rpb24gc3Bhd25XZWJXb3JrZXIodXJpOiBzdHJpbmcsIGluc3RhbmNlOiBXZWJXb3JrZXJJbnN0YW5jZSk6IHZvaWQge1xuICBjb25zdCB3ZWJXb3JrZXI6IFdvcmtlciA9IG5ldyBXb3JrZXIodXJpKTtcbiAgY29uc3Qgc2luayA9IG5ldyBQb3N0TWVzc2FnZUJ1c1Npbmsod2ViV29ya2VyKTtcbiAgY29uc3Qgc291cmNlID0gbmV3IFBvc3RNZXNzYWdlQnVzU291cmNlKHdlYldvcmtlcik7XG4gIGNvbnN0IGJ1cyA9IG5ldyBQb3N0TWVzc2FnZUJ1cyhzaW5rLCBzb3VyY2UpO1xuXG4gIGluc3RhbmNlLmluaXQod2ViV29ya2VyLCBidXMpO1xufVxuIl19