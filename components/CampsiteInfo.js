import React, { Component } from "react";
import { Text, View, ScrollView, FlatList, Modal, Button, StyleSheet, Alert, PanResponder, share } from "react-native";
import { Card , Icon} from "react-native-elements";
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite } from '../redux/ActionCreators';
import { Rating, Input } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
  return {
    campsites: state.campsites,
    comments: state.comments,
    favorites: state.favorites
  };
};

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId))
};

function RenderCampsite(props){
    const {campsite} = props;

    const view = React.createRef();

    const recognizeDrag = ({dx}) => (dx < -200) ? true : false;

    const recognizeComment = ({dx}) => (dx < 200) ? true : false;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            view.current.rubberBand(1000)
            .then(endState => console.log(endState.finished ? 'finished' : 'canceled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            console.log('pan responder end', gestureState);
            if (recognizeDrag(gestureState)) {
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + campsite.name + ' to favorites?',
                    [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                            onPress: () => console.log('Cancel Pressed')
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ?
                                console.log('Already set as a favorite') : props.markFavorite()
                        }
                    ],
                    { cancelable: false }
                );
            } else if(!recognizeDrag(gestureState)) {
                if(!recognizeComment(gestureState)) {
                    props.onShowModal();
                }
            }
            return true;
        }
    });

    const shareCampsite = (title, message, url) => {
        Share.share({
            title: title,
            message: `${title}: ${message} ${url}`,
            url: url
        },{
            dialogTitle: 'Share ' + title
        });
    };

    if(campsite){
        return (
            <Animatable.View 
                animation='fadeInDown' 
                duration={2000} 
                delay={1000}
                ref={view}
                {...panResponder.panHandlers}
            >
                <Card 
                    featuredTitle={campsite.name}
                    image={{uri: baseUrl + campsite.image}}
                >
                    <Text style={{margin:10}}> {campsite.description} </Text> 
                    <View style={styles.cardRow}>
                        <Icon
                            name={props.favorite ? 'heart' : 'heart-o'}
                            type='font-awesome'
                            color='#f50'
                            raised
                            reverse
                            onPress={() => props.favorite ? 
                                console.log('Already set as a favorite') : props.markFavorite()}
                        />
                        <Icon 
                            style={styles.cardItem}
                            name={props.favorite ? 'pencil' : 'pencil'}
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.onShowModal()}
                        />
                        <Icon
                            name={'share'}
                            type='font-awesome'
                            color='#5637DD'
                            style={styles.cardItem}
                            raised
                            reverse
                            onPress={() => shareCampsite(campsite.name, campsite.description, baseUrl + campsite.image)} 
                        />
                    </View>
                </Card>
            </Animatable.View>

        )
    } 
        return <View/>
}

function RenderComments({comments}) {

    const renderCommentItem = ({item}) => {
        return (
            <View style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.text}</Text>
                <Rating 
                    style={{fontSize: 12}}
                    startingValue={item.rating}
                    imageSize={10}
                    style={{alignItems: 'flex-start', paddingVertical: '5%'}}
                    readonly
                />
                <Text style={{fontSize: 12}}>{`-- ${item.author}, ${item.date}`}</Text>
            </View>
        );
    };

    return (
        <Animatable.View animation='fadeInUp' duration={2000} delay={1000}>
            <Card title='Comments'>
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}


class CampsiteInfo extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showModal: false,
            rating: 5,
            author: '',
            text: '',
        };
    }

    toggleModal() {
        this.setState({showModal: !this.state.showModal});
    }

    handleComment(campsiteId) {
        console.log(JSON.stringify(this.state));
        this.toggleModal(campsiteId);
    }

    resetForm() {
        this.setState({
            showModal: false,
        });
    }

    submitForm() {
        this.setState({
            showModal: false,
            rating: 5,
            author: '',
            text: '',
        });
    }

    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }
    static navigationOptions = {
        tilte:"Campsite Information"
    }

    render() {
        const campsiteId = this.props.navigation.getParam("campsiteId");
        const campsite = this.props.campsites.campsites.filter( camp => camp.id == campsiteId)[0];
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);

        return (
            <ScrollView>
                <RenderCampsite campsite={campsite} 
                    favorite={this.props.favorites.includes(campsiteId)}
                    markFavorite={() => this.markFavorite(campsiteId)}
                    onShowModal={() => this.toggleModal()}
                />
                <RenderComments comments={comments} />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modal}>
                        <Rating 
                            showRating
                            startingValue={this.rating}
                            imageSize={40}
                            onFinishRating={(rating)=>this.setState({rating: rating})} 
                            style={{paddingVertical: 10}}
                        />
                        <Input 
                            placeholder='AUTHOR'
                            leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                            leftIconContainerStyle={'paddingRight: 10'}
                            onChangeText={(text)=>this.setState({text: text})} 
                            value=''
                        />
                        <Input 
                            placeholder='COMMENT'
                            leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                            leftIconContainerStyle={'paddingRight: 10'}
                            onChangeText={(text)=>this.setState({text: text})}
                            value=''
                        />
                        <View>
                        <Button 
                            onPress={() => {
                                this.toggleModal();
                                this.submitForm();
                            }}
                            color='#5637DD'
                            title='Submit'
                        />
                        </View>
                        <View style={{margin: 10}}>
                            <Button
                                onPress={() => {
                                    this.toggleModal();
                                    this.restForm();
                                }}
                                color='#808080'
                                title='Cancel'
                            />
                        </View>
                    </View>
                    
                </Modal>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    cardRow: {
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        margin: 20,
    },
    cardItem: {
        flex: 1,
        margin: 10,
    },
    modal: {
        justifyContent: 'center',
        margin: 20,
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo); 