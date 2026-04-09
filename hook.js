// frida -U -l hook.js 大麦
function HashMap2Str(params_hm) {
  var HashMap = Java.use("java.util.HashMap");
  var args_map = Java.cast(params_hm, HashMap);
  return args_map.toString();
}

function HashMap2Dict(params_hm) {
  var HashMap = Java.use("java.util.HashMap");
  var args_map = Java.cast(params_hm, HashMap);
  var dict = {};
  var keys = args_map.keySet().toArray();
  for (var i = 0; i < keys.length; i++) {
    var value = args_map.get(keys[i]);
    dict[keys[i]] = JavaStringify(value);
  }
  return dict;
}

function JavaStringify(value) {
  if (value === null || value === undefined) {
    return null;
  }
  try {
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }
    if (value.$className) {
      return value.toString();
    }
    return String(value);
  } catch (e) {
    return `[unprintable: ${e}]`;
  }
}

function getAppClassLoader() {
  var ActivityThread = Java.use("android.app.ActivityThread");
  var application = ActivityThread.currentApplication();
  if (application === null) {
    return null;
  }
  return application.getApplicationContext().getClassLoader();
}

function buildMtopParams() {
    var result = null;
    var error = null;

    try {
      var loader = getAppClassLoader();
      if (loader !== null) {
        Java.classFactory.loader = loader;
      }

      var MtopRequest = Java.use("mtopsdk.mtop.domain.MtopRequest");
      var MtopBusiness = Java.use("com.taobao.tao.remotebusiness.MtopBusiness");
      var MethodEnum = Java.use("mtopsdk.mtop.domain.MethodEnum");
      var System = Java.use("java.lang.System");
      var ApiID = Java.use("mtopsdk.mtop.common.ApiID");
      var MtopStatistics = Java.use("mtopsdk.mtop.util.MtopStatistics");
      var InnerProtocolParamBuilderImpl = Java.use(
        "mtopsdk.mtop.protocol.builder.impl.InnerProtocolParamBuilderImpl"
      );

      var customMtopRequest = MtopRequest.$new();
      customMtopRequest.setApiName("mtop.damai.item.detail.getdetail");
      customMtopRequest.setData(
        '{"itemId":"1035663663342","platform":"271","comboChannel":"1","dmChannel":"damai@damaiapp_pioneer"}'
      );
      customMtopRequest.setVersion("1.0");
      customMtopRequest.setNeedEcode(true);
      customMtopRequest.setNeedSession(true);

      var myMtopBusiness = MtopBusiness.build(customMtopRequest);
      myMtopBusiness.useWua();
      myMtopBusiness.reqMethod(MethodEnum.POST.value);
      myMtopBusiness.setCustomDomain("mtop.damai.cn");
      myMtopBusiness.setBizId(24);
      myMtopBusiness.setErrorNotifyAfterCache(true);
      myMtopBusiness.reqStartTime = System.currentTimeMillis();
      myMtopBusiness.isCancelled = false;
      myMtopBusiness.isCached = false;
      myMtopBusiness.clazz = null;
      myMtopBusiness.requestType = 0;
      myMtopBusiness.requestContext = null;
      myMtopBusiness.mtopCommitStatData(false);
      myMtopBusiness.sendStartTime = System.currentTimeMillis();

      var createListenerProxy = myMtopBusiness.$super.createListenerProxy(
        myMtopBusiness.$super.listener.value
      );
      var createMtopContext = myMtopBusiness.createMtopContext(createListenerProxy);
      var myMtopStatistics = MtopStatistics.$new(null, null);
      createMtopContext.stats.value = myMtopStatistics;
      myMtopBusiness.$super.mtopContext.value = createMtopContext;
      createMtopContext.apiId.value = ApiID.$new(null, createMtopContext);

      createMtopContext.mtopRequest.value = customMtopRequest;
      var myInnerProtocolParamBuilderImpl = InnerProtocolParamBuilderImpl.$new();
      var res = myInnerProtocolParamBuilderImpl.buildParams(createMtopContext);
      result = JSON.stringify(HashMap2Dict(res), null, 2);
    } catch (e) {
      error = e && e.stack ? e.stack : String(e);
    }

  if (error !== null) {
    throw new Error(error);
  }

  return result;
}

rpc.exports = {
  buildparams: buildMtopParams,
};