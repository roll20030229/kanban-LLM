'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '输入描述...',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none min-h-[120px] px-3 py-2 outline-none',
          'prose-p:my-1 prose-headings:my-2',
          className
        ),
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="flex items-center gap-0.5 p-1.5 border-b border-gray-200 bg-gray-50 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7',
            editor.isActive('bold') && 'bg-gray-200'
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7',
            editor.isActive('italic') && 'bg-gray-200'
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7',
            editor.isActive('code') && 'bg-gray-200'
          )}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7',
            editor.isActive('bulletList') && 'bg-gray-200'
          )}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7',
            editor.isActive('orderedList') && 'bg-gray-200'
          )}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            'h-7 w-7',
            editor.isActive('blockquote') && 'bg-gray-200'
          )}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3.5 w-3.5" />
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-3.5 w-3.5" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
