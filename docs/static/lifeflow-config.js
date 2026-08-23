window.appUrl = (path) => {
  const prefix = window.lifeFlowConfig.pathPrefix || "/";
  return `${prefix}${String(path).replace(/^\/+/, "")}`;
};