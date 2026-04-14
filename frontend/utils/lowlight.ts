import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";

const lowlight = createLowlight();

lowlight.register("javascript", javascript);
lowlight.register("python", python);
lowlight.register("cpp", cpp);

export default lowlight;
