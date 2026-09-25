import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ModelSelector } from './ModelSelector'

const models = [
  { id: 'a/fast', name: 'Fast Model' },
  { id: 'b/big', name: 'Big Model' },
]

describe('ModelSelector (controlled)', () => {
  it('opens from outside, lists models, and reports the choice and the close', () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <ModelSelector
        models={models}
        value="a/fast"
        onChange={onChange}
        open
        onOpenChange={onOpenChange}
        compact
      />
    )
    fireEvent.click(screen.getByText('Big Model'))
    expect(onChange).toHaveBeenCalledWith('b/big')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('stays closed until the parent opens it', () => {
    function Parent() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            open it
          </button>
          <ModelSelector
            models={models}
            value="a/fast"
            onChange={() => {}}
            open={open}
            onOpenChange={setOpen}
          />
        </>
      )
    }
    render(<Parent />)
    expect(screen.queryByText('Big Model')).toBeNull()
    fireEvent.click(screen.getByText('open it'))
    expect(screen.getByText('Big Model')).toBeInTheDocument()
  })

  it('still works uncontrolled, as on the setup screen', () => {
    const onChange = vi.fn()
    render(<ModelSelector models={models} value="a/fast" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: /Fast Model/ }))
    fireEvent.click(screen.getByText('Big Model'))
    expect(onChange).toHaveBeenCalledWith('b/big')
  })
})

describe('ModelSelector groups and prices', () => {
  const grouped = [
    { id: 'a/rec', name: 'Rec Model', tag: 'recommended' as const, price: 0.75 },
    { id: 'b/free:free', name: 'Free Model', tag: 'free' as const, price: 0 },
    { id: 'c/other', name: 'Other Model', price: 3 },
  ]

  it('labels the groups and shows each price', () => {
    render(<ModelSelector models={grouped} value="a/rec" onChange={() => {}} open />)
    for (const heading of ['Recommended', 'Free to use', 'All models']) {
      expect(screen.getByText(heading)).toBeInTheDocument()
    }
    expect(screen.getByText(/\$0\.75 \/ 1M in/)).toBeInTheDocument()
    expect(screen.getByText(/Free$/)).toBeInTheDocument()
    expect(screen.getByText(/\$3\.00 \/ 1M in/)).toBeInTheDocument()
  })

  it('skips the headings when there is only one group', () => {
    render(
      <ModelSelector models={[{ id: 'x/y', name: 'Only' }]} value="x/y" onChange={() => {}} open />
    )
    expect(screen.queryByText('All models')).toBeNull()
    expect(screen.queryByText('Recommended')).toBeNull()
  })
})
