const forge = require('node-forge')

module.exports = () => {
  const hexString = forge.util.bytesToHex(forge.random.getBytesSync(9))
  var mostSiginficativeHexAsInt = parseInt(hexString[0], 16)
  if (mostSiginficativeHexAsInt < 8) {
    return hexString
  }

  mostSiginficativeHexAsInt -= 8
  return mostSiginficativeHexAsInt.toString() + hexString.substring(1)
}
