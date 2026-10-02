import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoProps {
  original: string;
  modified: string;
  language?: string;
  theme?: string;
  options?: monaco.editor.IDiffEditorOptions;
}

const MonacoDiffEditor: React.FC<MonacoProps> = ({
  original,
  modified,
  language = 'python',
  theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs-light',
  options = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.createDiffEditor(containerRef.current, {
        theme,
        enableSplitViewResizing: false, // Do not allow resizing of the diff view.
        readOnly: true,
        automaticLayout: true,
        renderLineHighlight: "none",
        contextmenu: false,
        ...options,
      });

      const originalModel = monaco.editor.createModel(original, language);
      const modifiedModel = monaco.editor.createModel(modified, language);

      editorRef.current.setModel({
        original: originalModel,
        modified: modifiedModel,
      });

      // Cleanup on component unmount
      return () => {
        originalModel.dispose();
        modifiedModel.dispose();
        editorRef.current?.dispose();
      };
    }
  }, [original, modified, language, theme, options]);

  return <div ref={containerRef} style={{ height: '500px', width: '100%' }} />;
};

export default MonacoDiffEditor;
