import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useUI } from '@faststore/ui'

import Section from 'src/components/sections/Section/Section'
import { useCart } from 'src/sdk/cart'

import styles from './section.module.scss'

interface messageRecords {
  message: string
  records: number
}

interface CartToastData {
  cartId: string
  cartMessages: messageRecords[]
}

const UIToast = dynamic(
  () =>
    import(/* webpackChunkName: "UIToast" */ '@faststore/ui').then((module) => {
      return module.Toast
    }),
  { ssr: false }
)

function Toast() {
  const { toasts, pushToast } = useUI()
  const { messages, id: cartId } = useCart()

  useEffect(() => {
    if (!messages || !cartId) {
      return
    }

    const storageKey = 'cartToastData'

    const existingCartData = sessionStorage.getItem(storageKey)
    const cartToastData: CartToastData = existingCartData
      ? JSON.parse(existingCartData)
      : { cartId, cartMessages: [] }

    console.log('cartToastData', cartToastData)

    // Reset cartMessages if the cartId changes
    if (cartToastData.cartId !== cartId) {
      cartToastData.cartId = cartId
      cartToastData.cartMessages = []
    }

    messages.forEach((message) => {
      const existingMessage = cartToastData.cartMessages.find(
        (item) => item.message === message.text
      )

      if (existingMessage) {
        existingMessage.records += 1

        const restrictToast =
          existingMessage.records >= 2 &&
          message.text.includes('cannot be delivered for this coordinates')

        if (!restrictToast) {
          pushToast({
            message: message.text,
            status: message.status,
          })
        }
      } else {
        cartToastData.cartMessages.push({ message: message.text, records: 1 })
        pushToast({
          message: message.text,
          status: message.status,
        })
      }
    })

    sessionStorage.setItem(storageKey, JSON.stringify(cartToastData))
  }, [messages, pushToast, cartId])

  return (
    <>
      {toasts.length > 0 && (
        <Section className={`${styles.section} section-toast`}>
          <UIToast />
        </Section>
      )}
    </>
  )
}

export default Toast
