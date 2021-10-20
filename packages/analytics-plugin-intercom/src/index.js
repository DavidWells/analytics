import intercomNode from "./node";
import intercomBrowser from "./browser";

/* This module will shake out unused code + work in browser and node 🎉 */
export default process.browser ? intercomBrowser : intercomNode;
