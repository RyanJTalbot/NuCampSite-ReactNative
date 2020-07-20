import React, { Component } from 'react';
import { Text, View, ScrollView, FlatList, Modal, Button, StyleSheet, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';


const mapStateToProps = state => {
    return {
        campsites: state.campsites,
        comments: state.comments,
        favorites: state.favorites
    };
}

const mapDispatchToProps = {
    postFavorite: campsiteId => (postFavorite(campsiteId)),
    postComment: (campsiteId, rating, author, text, date) => (postComment(campsiteId, rating, author, text, date))
};

function RenderComments({comments}) {

    const renderCommentItem = ({item}) => {
        return (
            <View style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.text}</Text>
                <Rating 
                    staringValue={item.rating}
                    imageSize={10}
                    style={{alignItems: 'flex-start', paddingVertical: '5%'}}
                    read-only
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

function RenderCampsite(props) {
    const recognizeComment = ({dx}) => (dx < 200 ) ? true: false;

    const {campsite} = props;
    const recognizeDrag = ({dx}) => (dx < -200) ? true: false;
    const view = React.createRef();

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
            }
            
            else if (recognizeComment(gestureState)) {
                props.showModal()
            }
            return true;
        }
    });

    const shareCampsite = (title, message, url) => {
        Share.share({
            title,
            message: `${title}: ${message} ${url}`,
            url
        },{
            dialogTitle: 'Share ' + title
        });
    };
    
    if (campsite) {
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
                    image={{uri: baseUrl + campsite.image}}>
                    <Text style={{margin: 10}}>
                        {campsite.description}
                    </Text>
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
                            name={props.favorite ? 'pencil' : 'pencil'}
                            style={styles.cardItem}
                            type='font-awesome'
                            color='#5637DD'
                            raised
                            reverse
                            onPress={() => props.showModal()} 
                                
                        />
                        <Icon
                            name={'share'}
                            type='font-awesome'
                            color='#5637DD'
                            style={styles.cardItem}
                            raised
                            reversed
                            onPress={() => shareCampsite(campsite.name, campsite.description, baseUrl + campsite.image)} 
                        />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    return <View />;
}

class CampsiteInfo extends Component {
    constructor(props){
        super(props);
        this.state = {
            showModal: false,
            rating: 5,
            author: '',
            text: ''
        };
    }

    toggleModal(){
        this.setState({showModal: !this.state.showModal})
    }

    handleComment(campsiteId){
        const date = new Date().toISOString();
        this.props.postComment(campsiteId, this.state.rating, this.state.author, this.state.text, date);
        this.toggleModal();
    }

    resetForm(){
        this.setState({showModal: false,
            rating: 5,
            author: '',
            text: ''})
    }

    static navigationOptions = {
        title: 'Campsite Information'
    };

    markFavorite(campsiteId) {
        this.props.postFavorite(campsiteId);
    }

    render() {
        const campsiteId = this.props.navigation.getParam('campsiteId');
        const comments = this.props.comments.comments.filter(comment => comment.campsiteId === campsiteId);
        const campsite = this.props.campsites.campsites.filter(campsite => campsite.id === campsiteId)[0];
        return (
            <ScrollView>
                <RenderCampsite campsite={campsite} 
                                favorite={this.props.favorites.includes(campsiteId)}
                                markFavorite={() => this.markFavorite(campsiteId)}
                                showModal={() => this.toggleModal()} />
                <RenderComments comments={comments} />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onRequestClose={() => this.toggleModal()}>
                    <View style={styles.modal}>
                            <View style={{margin: 10}}>
                                <Button
                                    onPress={() => {
                                        this.handleComment(campsiteId);
                                        this.resetForm();
                                    }}
                                    color='#5637DD'
                                    title='Submit'
                                />
                            </View>
                        <View style={{margin: 10}}>
                            <Button
                                onPress={() => {
                                    this.toggleModal();
                                    this.resetForm();
                                }}
                                color='#808080'
                                title='Cancel'
                            />
                        </View>
                    <Rating 
                        showRating
                        startingValue={this.state.rating}
                        imageSize={40}
                        onFinishRating={(rating)=>this.setState({rating: rating})}
                        style={{paddingVertical: 10}}
                        />
                    <Input 
                        placeholder= 'name'
                        leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                        leftIconContainerStyle={{paddingRight: 10}}
                        onChangeText={(name)=> this.setState({author: name})}
                        value={this.state.author}
                    />
                    <Input 
                        placeholder= 'comment'
                        leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                        leftIconContainerStyle={{paddingRight: 10}}
                        onChangeText={(comment)=> this.setState({text: comment})}
                        value={this.state.text}
                    />
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    cardRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 20
    },
    cardItem: {
        margin: 10,
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 20
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(CampsiteInfo);
