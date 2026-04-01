import { useState, useRef, Suspense } from 'react'
import Editor from '@monaco-editor/react'
import { loader } from '@monaco-editor/react'
import api from '../api'

loader.config({
  paths: {
    vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs'
  }
})

const LANGUAGES = ['python','javascript','typescript','java','cpp','c','go','rust','kotlin','swift']

const langLabels = {
  python:'Python', javascript:'JavaScript', typescript:'TypeScript',
  java:'Java', cpp:'C++', c:'C', go:'Go', rust:'Rust', kotlin:'Kotlin', swift:'Swift'
}

const defaultCode = {
  python:     '# Write your solution here\ndef solution():\n    pass\n',
  javascript: '// Write your solution here\nfunction solution() {\n    \n}\n',
  typescript: '// Write your solution here\nfunction solution(): void {\n    \n}\n',
  java:       '// Write your solution here\nclass Solution {\n    public void solve() {\n        \n    }\n}\n',
  cpp:        '// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution() {\n    \n}\n',
  c:          '// Write your solution here\n#include <stdio.h>\n\nvoid solution() {\n    \n}\n',
  go:         '// Write your solution here\npackage main\n\nfunc solution() {\n    \n}\n',
  rust:       '// Write your solution here\nfn solution() {\n    \n}\n',
  kotlin:     '// Write your solution here\nfun solution() {\n    \n}\n',
  swift:      '// Write your solution here\nfunc solution() {\n    \n}\n',
}

export default function CodeEditor({ problem, onSaved }) {
  const [language, setLanguage] = useState(problem.solution?.language || 'python')
  const [code,     setCode]     = useState(problem.solution?.code     || defaultCode['python'])
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const editorRef = useRef(null)

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    if (!problem.solution?.code) setCode(defaultCode[lang] || '')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post(`/problems/${problem.id}/solution/`, { code, language })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKeyDown}>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#0d0d0d]">
        <div className="flex gap-1 flex-wrap">
          {LANGUAGES.map(lang => (
            <button key={lang} onClick={() => handleLanguageChange(lang)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                language === lang
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'text-gray-600 hover:text-gray-400 border border-transparent'
              }`}>
              {langLabels[lang]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-green-400 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Saved
            </span>
          )}
          <span className="text-[10px] text-gray-600">Ctrl+S to save</span>
          <button onClick={handleSave} disabled={saving}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-400 text-black text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1.5">
            {saving
              ? <span className="inline-block w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
              : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
            }
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[320px]">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
            <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"/>
          </div>
        }>
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={val => setCode(val || '')}
            onMount={editor => { editorRef.current = editor }}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              tabSize: 4,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}