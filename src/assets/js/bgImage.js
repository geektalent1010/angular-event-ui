unlayer.registerTool({
  name: "my_bg_img_tool",
  label: "BG Image",
  icon: "fa-image",
  supportedDisplayModes: ["web", "email"],
  options: {
    colors: {
      // Property Group
      title: "Colors", // Title for Property Group
      position: 1, // Position of Property Group
      options: {
        backgroundColor: {
          // Property: backgroundColor
          label: "Background Color", // Label for Property
          defaultValue: "#FF0000",
          widget: "color_picker", // Property Editor Widget: color_picker
        },
      },
    },
  },
  values: {},
  renderer: {
    Viewer: unlayer.createViewer({
      render(values) {
        return "";
      },
    }),
    exporters: {
      web: function (values) {
        return "";
      },
      email: function (values) {
        return "";
      },
    },
    head: {
      css: function (values) {
        // console.log("values => ", values)
        // console.log("values._meta.htmlID => ", values._meta.htmlID)
        // return `#${values._meta.htmlID} { background-color: ${values.backgroundColor}; color: ${values.textColor}; }`
        return '#u_body { background-image: url(https://www.swiftdigital.com.au/wp-content/uploads/2021/06/free-online-photo-editors.jpg); }';
      },
      js: function (values) {
        return 'console.log("Tool JavaScript");';
      },
    },
  },
  validator(data) {
    return [];
  },
});
