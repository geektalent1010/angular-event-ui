export const checkMessageForExtensionsData = (message, extensionKey) => {
  let output = null;

  if (message.hasOwnProperty("metadata")) {
    const metadata = message.metadata;
    const injectedObject = metadata["@injected"];
    if (injectedObject && injectedObject.hasOwnProperty("extensions")) {
      const extensionsObject = injectedObject["extensions"];
      if (extensionsObject && extensionsObject.hasOwnProperty(extensionKey)) {
        output = extensionsObject[extensionKey];
      }
    }
  }

  return output;
};

export const generateUniqueGLCode = () => {
  return 'xxxxx-xxxxx-xxxxx'.replace(/[x]/g, (c) => {
    return String(Math.floor((Math.random() * 100) % 10));
  });
};
