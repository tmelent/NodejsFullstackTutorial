import React, { useCallback, useMemo, useState } from "react";
import { createEditor, Editor, Transforms, Element, Text } from "slate";
import { DefaultElement, Editable, Slate, withReact } from "slate-react";
import { CustomElement } from "../../types";
import { CodeElement, CustomEditor } from "./slateElements";

interface SlateWindowProps {}

export const SlateWindow: React.FC<SlateWindowProps> = ({}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  // Add the initial value when setting up our state.
  const lsContent = typeof window !== 'undefined' ? localStorage.getItem('content') : null
  const [value, setValue] = useState(
    lsContent
      ? JSON.parse(lsContent)
      : [
          {
            type: "paragraph",
            children: [{ text: "" }],
          },
        ]
  );

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case "code":
        return <CodeElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const Leaf = (props: any) => {
    return (
      <span
        {...props.attributes}
        style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}
      >
        {props.children}
      </span>
    );
  };

  const renderLeaf = useCallback((props) => {
    return <Leaf {...props} />;
  }, []);

  return (
    // Add a toolbar with buttons that call the same methods.
    <Slate
      editor={editor}
      value={value as any}
      onChange={(value) => {
        setValue(value as any);
        const content = JSON.stringify(value);
        localStorage.setItem("content", content);
      }}
    >
      <div>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleBoldMark(editor);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            CustomEditor.toggleCodeBlock(editor);
          }}
        >
          Code Block
        </button>
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        onKeyDown={(event) => {
          if (!event.ctrlKey) {
            return;
          }

          switch (event.key) {
            case "`": {
              event.preventDefault();
              CustomEditor.toggleCodeBlock(editor);
              break;
            }

            case "b": {
              event.preventDefault();
              CustomEditor.toggleBoldMark(editor);
              break;
            }
          }
        }}
      />
    </Slate>
  );
};
