
export const getCompileFlags = () => {
    const buildMode = process.env['NODE_ENV'];
    const buildVersion =  process.env['BUILD_VERSION'];
    const isProduction = buildMode === "production" ? true : false;

    return {buildMode, buildVersion, isProduction}
}
