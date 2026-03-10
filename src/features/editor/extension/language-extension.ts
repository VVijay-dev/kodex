import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import {Extension} from "@codemirror/state"
import { java } from "@codemirror/lang-java";
import { json } from "@codemirror/lang-json";
import {markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { yaml } from "@codemirror/lang-yaml";
import { xml } from "@codemirror/lang-xml";
import {css} from  "@codemirror/lang-css";

export const getLanguageExtension = (fileName:string): Extension =>{
    const file = fileName.split(".")?.pop()?.toLowerCase();
    switch(file){
        case 'js':
            return javascript()
        case 'jsx':
            return javascript({jsx:true})
        case 'ts':
            return javascript({typescript:true})
        case 'tsx':
            return javascript({typescript:true,jsx:true})
        case 'html':
            return html()
        case 'java':
            return java()
        case 'json':
            return json()
        case 'md':
        case 'mdx':
            return markdown()
        case 'py':
            return python()
        case 'yaml':
            return yaml()
        case 'xml':
            return xml()
        case 'css':
            return css()
        default:
            return []
    }

}