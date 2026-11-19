import { describe, expect, it } from 'vitest'
import vi from '../../messages/vi.json'
import en from '../../messages/en.json'

type Tree = { [k: string]: string | Tree }

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    return typeof v === 'string' ? { ...acc, [key]: v } : { ...acc, ...flatten(v, key) }
  }, {})
}

describe('messages parity', () => {
  const fv = flatten(vi as Tree)
  const fe = flatten(en as Tree)

  it('vi and en have the same keys', () => {
    expect(Object.keys(fe).sort()).toEqual(Object.keys(fv).sort())
  })
  it('no empty strings', () => {
    for (const [k, v] of Object.entries({ ...fv, ...fe })) expect(v.trim(), k).not.toBe('')
  })
  it('has the base namespaces', () => {
    for (const ns of ['nav', 'trip', 'itinerary', 'common', 'explore', 'trips', 'me']) expect(vi).toHaveProperty(ns)
  })
})
