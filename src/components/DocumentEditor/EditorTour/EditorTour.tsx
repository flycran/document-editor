import type { TourProps } from 'antd'
import { Tour } from 'antd'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { STORAGE_KEY, tourOpenAtom } from '../DocumentEditorStore'

export interface EditorTourProps {
  open: boolean
  onClose: () => void
}

/** 获取 DOM 元素，找不到时返回 null */
function getTarget(id: string): HTMLElement | null {
  return document.querySelector(`[data-tour-id="${id}"]`)
}

/** 变量选择器 Drawer 是否已打开 */
function isDrawerOpen(): boolean {
  return !!getTarget('variable-selector')?.getClientRects().length
}

/** 变量表单 Drawer 是否已打开 */
function isFormOpen(): boolean {
  return !!getTarget('variable-form-drawer')?.getClientRects().length
}

/** 编辑器引导组件
 *
 * 完全通过 DOM 选择器（data-tour-id）定位目标元素，不与编辑器内部状态耦合。
 * 引导完成状态存储在 localStorage，首次自动弹出，完成后不再弹出。
 */
export default function EditorTour() {
  const [open, setOpen] = useAtom(tourOpenAtom)
  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }

  const [step, setStep] = useState(0)

  // 重新打开引导时从头开始（手动触发帮助按钮时尤为必要）
  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  /** 打开 Drawer 后延迟切步骤（等动画） */
  const openDrawerThen = (target: number) => {
    if (!isDrawerOpen()) {
      getTarget('toolbar-variable')?.click()
      setTimeout(() => setStep(target), 500)
    } else {
      setStep(target)
    }
  }

  /** 关闭 Drawer 后延迟切步骤 */
  const closeDrawerThen = (target: number) => {
    if (isDrawerOpen()) {
      getTarget('toolbar-variable')?.click()
      setTimeout(() => setStep(target), 100)
    } else {
      setStep(target)
    }
  }

  /** 打开变量表单后延迟切步骤 */
  const openFormThen = (target: number) => {
    if (!isFormOpen()) {
      getTarget('toolbar-variable-form')?.click()
      setTimeout(() => setStep(target), 500)
    } else {
      setStep(target)
    }
  }

  /** 关闭变量表单后延迟切步骤 */
  const closeFormThen = (target: number) => {
    if (isFormOpen()) {
      getTarget('toolbar-variable-form')?.click()
      setTimeout(() => setStep(target), 100)
    } else {
      setStep(target)
    }
  }

  const steps: TourProps['steps'] = [
    {
      title: '编辑区域',
      description:
        '这是文书编辑区，你可以在这里直接输入和编辑文书内容。所有文本格式调整都会实时生效。',
      target: () => getTarget('editor-content')!,
    },
    {
      title: '插入变量',
      description:
        '点击此按钮可以打开变量选择器，从模板库中选择变量插入到文中。变量会在预览模式下替换为实际值。',
      target: () => getTarget('toolbar-variable')!,
      onNext: () => openDrawerThen(step + 1),
    },
    {
      title: '变量选择器',
      description: '在变量选择器中，你可以切换模板、搜索变量，然后点击变量将其插入到光标位置。',
      target: () => getTarget('variable-selector')!,
      placement: 'left',
      onNext: () => closeDrawerThen(step + 1),
      onPrev: () => closeDrawerThen(step - 1),
    },
    {
      title: '插入签名',
      description: '点击此按钮可以选择不同类型的签名占位符插入到文中，支持多种签名样式。',
      target: () => getTarget('toolbar-signature')!,
      onPrev: () => openDrawerThen(step - 1),
    },
    {
      title: '切换预览模式',
      description:
        '点击预览按钮可以在编辑模式和预览模式之间切换。预览模式下可以看到变量替换后的最终效果，但不可编辑。',
      target: () => getTarget('toolbar-preview')!,
    },
    {
      title: '预览变量表单',
      description:
        '点击此按钮可以打开变量赋值面板，为每个变量填写测试值，方便在预览模式下查看变量替换后的效果。',
      target: () => getTarget('toolbar-variable-form')!,
      onNext: () => openFormThen(step + 1),
    },
    {
      title: '变量赋值面板',
      description:
        '在变量赋值面板中，你可以为文档中的每个变量填写测试值。填写后点击"应用预览"即可在预览模式下看到替换效果。',
      target: () => getTarget('variable-form-drawer')!,
      placement: 'left',
      nextButtonProps: {
        children: '结束且不再显示引导',
      },
      onNext: () => closeFormThen(step + 1),
      onPrev: () => closeFormThen(step - 1),
    },
  ]

  return (
    <Tour
      open={open}
      current={step}
      onChange={setStep}
      onClose={handleClose}
      steps={steps}
      type="primary"
    />
  )
}

/** 检查是否已完成引导 */
export function isTourCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}
