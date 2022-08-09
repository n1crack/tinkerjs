import React from 'react';
import {createRoot} from 'react-dom/client';
import * as monaco from 'monaco-editor';

// monaco editor web workers settings
self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
            return './json.worker.js';
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
            return './css.worker.js';
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './html.worker.js';
        }
        if (label === 'typescript' || label === 'javascript') {
            return './ts.worker.js';
        }
        return './editor.worker.js';
    }
};

import Editor, {loader} from "@monaco-editor/react";

loader.config({monaco});

let editorRef = null;

// Splitter
import Splitter, {SplitDirection} from '@devbookhq/splitter'

// FormatHighlight
import formatHighlight from 'json-format-highlight'

const colorOptions = {
    keyColor: '#ffffff',
    numberColor: "#ff7a00",
    stringColor: '#a7e399',
    trueColor: '#00cc00',
    falseColor: '#ff5858',
    nullColor: '#3bccc5'
};

const outputContainer = (value, type = "output") => {
    let borderColor = "border-lime-700";
    let bgColor = "bg-lime-700";
    let bottomMargin = "mb-10";
    let bottomRef = '<div id="bottomRef"></div>';

    if (type === "log") {
        borderColor = "border-slate-700";
        bgColor = "bg-slate-700";
        bottomMargin = "";
        bottomRef = '';
    } else if (type === "error") {
        borderColor = "border-red-600";
        bgColor = "bg-red-600";
    }

    return "<pre class='relative my-3 " + bottomMargin + " p-2 pt-6 text-xs rounded border-2 " + borderColor + "'><span class='absolute left-1 -my-8 py-1 px-1 text-gray-200 " + bgColor + " rounded text-xs'>" + type + "</span>" + value + "</pre>" + bottomRef;
}

console.tlog = console.log
console.log = (...values) => {
    const output = document.getElementById('tinkerjs-output');

    values.forEach((value) => {
        if (typeof value === "object") {
            output.insertAdjacentHTML('beforeend', outputContainer(pretty(value), 'log'));
        } else {
            output.insertAdjacentHTML('beforeend', outputContainer(value, 'log'));
        }
    })
}

const pretty = (obj) => {
    return formatHighlight(JSON.stringify(obj, undefined, 2), colorOptions);
}

const printOutput = (value) => {
    const output = document.getElementById('tinkerjs-output');
    try {
        let out = eval(value);
        if (typeof value !== "object") {
            output.insertAdjacentHTML('beforeend', outputContainer(pretty(out)));
        } else {
            output.insertAdjacentHTML('beforeend', outputContainer(out));
        }

    } catch (error) {
        output.insertAdjacentHTML('beforeend', outputContainer(error, 'error'));
    }
}

const goToBottom = new Event('goToBottom');

const updateOutput = () => {
    const output = document.getElementById('tinkerjs-output');
    output.innerHTML = '';
    printOutput(editorRef.getValue());
    window.dispatchEvent(goToBottom);
}

const handleEditorDidMount = (editor, monaco) => {
    editorRef = editor;

    editor.updateOptions({
        scrollBeyondLastLine: false
    });

    editor.addAction({
        id: "executeUpdateOutput",
        label: "Run block",
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        contextMenuGroupId: "2_execution",
        run: () => {
            updateOutput();
        },
    });

    updateOutput();
    const myTimeout = setTimeout(function () {
        window.dispatchEvent(goToBottom);
    }, 1000);
}


// App class 
class App extends React.Component {
    render() {
        return (
            <div className="bg-codebg h-screen">
                <Splitter direction={SplitDirection.Horizontal} onMount={updateOutput}>
                    <div className="sticky z-50 top-0 h-screen">
                        <Editor
                            height='100vh'
                            theme="vs-dark"
                            defaultLanguage="javascript"
                            defaultValue={[
                                '// do something..',
                                'console.log(5, "Hello World")',
                                '',
                                'console.log([123456, "Hey there.."])',
                                '',
                                'const menu = {"menu": {_key:4587, active:true, status:false, children:null,  "id": "file", "value": "File", "popup": {"menuitem": [{"value": "New", "onclick": "CreateNewDoc()"},{"value": "Open", "onclick": "OpenDoc()"},{"value": "Close", "onclick": "CloseDoc()"}]}}}',
                                '',
                                'console.log(menu);',
                                '',
                                '\tconst do_something = () => {',
                                '\t\treturn menu;',
                                '\t}',
                                '',
                                'do_something();'
                            ].join('\n')}
                            onMount={handleEditorDidMount}
                        />
                    </div>
                    <div id="tinkerjs-output" className="h-screen overflow-y-scroll px-3 text-gray-100">

                    </div>
                </Splitter>
                <div className="absolute bottom-0 right-5">
                    <button id="run"
                            className="px-2 py-1 rounded bg-emerald-500 text-slate-900 text-xs"
                            onClick={updateOutput}
                    >
                        Run (Ctrl/Cmd + Enter)
                    </button>
                </div>
            </div>
        );
    }
}

// React render
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(<App/>);
