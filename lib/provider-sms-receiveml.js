'use strict'

const parseMessage = require('parse-otp-message')
const got = require('got')
const debug = require('debug')('smsreceive.ml')

const OTPProvider = require('./otp-provider')

class SMSReceiveMLProvider extends OTPProvider {
  get name () {
    return 'smsreceive.ml'
  }

  /**
   * @param {any} apiKey
   */
  set key (apiKey) {
    this.key = apiKey
  }

  /**
   * @description Returns a number for sms verification purposes. You can use the same number for multiple services.
   *
   * @param {any} [opts={ }] services<string>: A comma delimited string of the services you want to use for this number.
   * @returns
   *
   * @memberOf SMSReceiveMLProvider
   */
  async getNumber (opts = { }) {
    let { services = 'facebook,venmo' } = opts

    let uri = `https://smsreceive.ml/USAPI.php?api=new&key=${this.key}&services=${services}`
    const { body } = await got(uri, { json: true })
    const { phoneNumber } = body

    debug(`Acquired ${phoneNumber} from smsreceive.ml`)

    return phoneNumber
  }

  /**
   * @description Returns the sms code found in verification message.
   *
   * @param {any} opts
   *
   * @memberOf SMSReceiveMLProvider
   */
  async getMessages () {
    let uri = `https://smsreceive.ml/USAPI.php?api=status&key=${this.key}`
    const { body } = await got(uri, { json: true })

    const { status, expirationTime, currentServices, sms } = body
    debug({ status, expirationTime, currentServices, sms })

    if (status === 'ready') {
      const parsed = parseMessage(sms)
      return parsed
    }
  }
}

module.exports = SMSReceiveMLProvider
