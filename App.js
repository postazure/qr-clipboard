import React from 'react'
import { AppState, Clipboard, Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import QRCodeGenerator from 'react-native-qrcode'

export default class App extends React.Component {
  state = {
    clipboardValue: null,
    appState: 'inactive'
  }

  fetchClipboardValue = async () => {
    this.setState({ clipboardValue: await Clipboard.getString() })
  }

  async componentDidMount () {
    await this.fetchClipboardValue()
    AppState.addEventListener('change', this._handleAppStateChange)
  }

  componentWillUnmount () {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange = async (nextAppState) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      await this.fetchClipboardValue()
    }
    this.setState({ appState: nextAppState })
  }

  renderQR = () => {
    if (this.state.clipboardValue) {
      return (
        <QRCode value={this.state.clipboardValue}/>
      )
    }
  }

  render () {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Clipboard as QR</Text>

        {this.renderQR()}


        {
          this.state.clipboardValue
            ? <TapToReveal>{this.state.clipboardValue}</TapToReveal>
            : <Text style={styles.plainText}>'Huh? Nothing in your clipboard'</Text>
        }
      </View>
    )
  }
}

class TapToReveal extends React.Component {
  state = {
    timeOfReveal: null
  }

  reveal = () => {
    setTimeout(() => this.setState({ timeOfReveal: null }), 3000)
    this.setState({ timeOfReveal: Date.now() })
  }

  render () {
    return (
      <View>
        {
          this.state.timeOfReveal
            ? <Text style={styles.plainText}>{this.props.children}</Text>
            : <TouchableOpacity onPress={this.reveal}>
              <Text style={[styles.plainText, styles.gray]}>*Tap To Reveal*</Text>
            </TouchableOpacity>

        }
      </View>
    )
  }
}

class QRCode extends React.Component {
  state = {
    highContrast: false
  }

  toggleContrast = () => {
    this.setState({highContrast: !this.state.highContrast})
  }

  render() {
    return (
      <TouchableOpacity onPress={this.toggleContrast}>
      <QRCodeGenerator
        value={this.props.value}
        size={Dimensions.get('window').width * 0.72}
        bgColor={this.state.highContrast ? 'white' : '#2D9C00'}
        fgColor='black'/>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 50,
    color: '#2D9C00',
  },
  plainText: {
    fontSize: 25,
    color: '#2D9C00',
  },
  gray: {
    color: '#5c5d5a',
  }
})

