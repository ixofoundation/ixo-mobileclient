// const {default: AssistantLogo} = require('../assets/top-assistant-icon.svg')
// const {default: CloseIcon} = require('../assets/close-icon.svg')
// const {default: ScanIcon} = require('../assets/qr-scan.svg')

const
    React = require('react'),
    {useState, useRef, useCallback, createElement: e} = React,
    {
        View, ScrollView, StyleSheet, TextInput, Pressable,
    } = require('react-native'),
    useBot = require('react-rasa-assistant'),
    {Modal, Text, QRScanner} = require('$/lib/ui'),
    handleCustomAssistantResponse = require('./assistantResponseHandler'),
    theme = require('$/lib/theme'),
    MessageBubble = require('$/assistant/MessageBubble'),
    ScanIcon = require('$/lib/icons/scan.svg').default,
    CloseIcon = require('$/lib/icons/close.svg').default,
    AssistantIcon = require('$/lib/icons/assistant.svg').default,
    ArrowUpIcon = require('$/lib/icons/arrowUp.svg').default,
    {default: LinearGradient} = require('react-native-linear-gradient')


const Assistant = ({initMsg, onClose = () => {}}) => {
    const
        {
            msgHistory, onInputRef, userText, setUserText, sendUserText,
            selectOption, botUtter, restartSession,
        } =
            useBot({
                sockUrl: process.env.RASA_SOCKET_URL,
                sockOpts: {transports: ['websocket']},
                initMsg,
                onError: e => console.error('assistant error', e),
                onUtter: msg =>
                    msg.action &&
                        handleCustomAssistantResponse(msg, botUtter),
            }),

        viewRef = useRef(),

        [qrModalVisible, setQrModalVisibility] = useState(false),
        openModal = useCallback(() => setQrModalVisibility(true)),
        closeModal = useCallback(() => setQrModalVisibility(false))

    return <View style={s.container}>
        <View style={s.sessionCtrlView}>
            <View style={s.headerBtn}/>
            <Pressable
                style={s.headerBtn}
                onLongPress={restartSession}
            >
                <AssistantIcon/>
            </Pressable>
            <Pressable
                style={s.headerBtn}
                onPress={onClose}
            >
                <CloseIcon/>
            </Pressable>
        </View>

        <ScrollView
            ref={viewRef}
            style={s.msgHistoryContainer}
            onContentSizeChange={() => viewRef.current.scrollToEnd()}
        >
            {msgHistory.map((m, mIdx) => {
                if (m.text)
                    return <MessageBubble 
                        key={m.ts + '-txt'}
                        direction={m.direction}>
                        <Text
                            style={m.direction === 'in' ? 
                                s.textMsgIn : s.textMsgOut}
                            direction={m.direction}
                            children={m.text}
                        />
                    </MessageBubble>

                if (m.quick_replies || m.buttons)
                    return (m.quick_replies || m.buttons).map((opt, optIdx) =>
                        <Pressable
                            key={m.ts + '-btn-' + opt.payload}
                            onPress={() => selectOption(mIdx, optIdx)}
                        >
                            <LinearGradient colors={['#FFFFFF', '#F8FAFD']} 
                                style={s.optionBtn}>
                                <Text>
                                    {opt.title}
                                </Text>
                            </LinearGradient>
                        </Pressable>)

                if (m.component) {
                    console.log(m)
                    return <MessageBubble direction={m.direction}> 
                        {e(m.component, {
                            key: m.ts + '-comp',
                            msg: m,
                        })}
                    </MessageBubble>
                }
                    
            })}

        </ScrollView>

        <View style={s.msgSendView}>
            <Pressable  style={s.scanBtn} onPress={openModal} >
                <ScanIcon/>
            </Pressable>

            <View style={s.msgInputContainer}>
                <TextInput
                    value={userText}
                    placeholder={'type here...'}
                    onChangeText={setUserText}
                    ref={onInputRef}
                    style={s.msgInput}
                />
                <Pressable 
                    style={s.sendBtn}
                    onPress={sendUserText}>
                    <ArrowUpIcon/>
                </Pressable>
            </View>
        </View>

        <Modal
            visible={qrModalVisible}
            onRequestClose={closeModal}
        >
            <QRScanner onScan={({data}) => {
                setUserText(userText + ' ' + data)
                closeModal()
            }} />
        </Modal>
    </View>

}

const s = StyleSheet.create({
    container: {
        backgroundColor: '#F0F3F9',
        flex: 1,
    },
    sessionCtrlView: {
        flexDirection: 'row',
        backgroundColor: 'black',
        padding: theme.spacing(1),
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerBtn: {
        width: 50,
    },
    textMsgIn: {
        color: 'black',
    },
    textMsgOut: {
        color: 'white',
    },
    msgHistoryContainer: {
        paddingHorizontal: theme.spacing(2), 
        paddingTop: theme.spacing(1),
    },
    optionBtn: {
        borderRadius: 8, 
        padding: theme.spacing(1), 
        marginBottom: theme.spacing(1),
    },
    msgSendView: {
        backgroundColor: 'white',
        flexDirection: 'row',
        padding: theme.spacing(1),
    },
    msgInputContainer: {
        flexGrow: 1,
        borderColor: '#E8EBED',
        borderRadius: 50,
        borderWidth: 2,
        padding: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    msgInput: {flex: 1, fontSize: 16},
    scanBtn: {justifyContent: 'center', alignItems: 'center', width: 50},
    sendBtn: {
        backgroundColor: '#49BFE0', 
        borderRadius: 50, 
        width: 40, 
        height: 40, 
        justifyContent: 'center', 
        alignItems: 'center',
    },
})


module.exports = Assistant
