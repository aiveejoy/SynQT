import React, { Component } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { BasicStyles, Color, Routes } from 'common'
import Footer from 'modules/generic/Footer'
import CardList from 'modules/generic/CardList'
import Style from './Style'
import { connect } from 'react-redux';
import { Spinner } from 'components';
import Api from 'services/api/index.js';
import CustomizedButton from 'modules/generic/CustomizedButton';
import _ from 'lodash';

class Connections extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prevActive: 0,
      currActive: 0,
      search: null,
      isShow: false,
      data: [],
      isLoading: false,
      limit: 8,
      offset: 0
    }
  }

  componentDidMount() {
    if (this.props.navigation?.state?.params?.fromComments) {
      this.setState({ data: this.props.navigation?.state?.params?.fromComments })
    } else {
      this.retrieve(false);
    }
  }

  loading = (loading) => {
    this.setState({ isLoading: loading })
  }

  retrieve(flag) {
    const { user, tempMembers } = this.props.state
    if (user == null) {
      return
    }
    let parameter = {
      condition: [{
        value: user.id,
        column: 'account_id',
        clause: '='
      }, {
        value: user.id,
        column: 'account',
        clause: 'or'
      }, {
        clause: "=",
        column: "status",
        value: "accepted"
      }],
      account_id: user.id,
      limit: this.state.limit,
      offset: flag == true && this.state.offset > 0 ? (this.state.offset * this.state.limit) : this.state.offset,
    }
    this.setState({ isLoading: true })
    Api.request(Routes.circleRetrieve, parameter, response => {
      this.setState({ isLoading: false })
      if (response.data.length > 0) {
        if (this.props.navigation?.state?.params?.addMember) {
          const par = {
            condition: [{
              value: this.props.navigation?.state?.params?.data?.messenger_group_id,
              column: 'messenger_group_id',
              clause: '='
            }],
            sort: {
              'created_at': 'DESC'
            }
          }
          this.setState({ isLoading: true });
          Api.request(Routes.messengerMembersRetrieve, par, res => {
            this.setState({ isLoading: false });
            if (res.data.length > 0) {
              let id = []
              res.data.map((item, ind) => {
                id.push(item?.information?.account_id)
              })
              let temp = []
              response.data.map((i, ind) => {
                if (id.includes(i?.account?.id) === false) {
                  temp.push(i);
                }
              })
              this.setState({
                data: flag == false ? temp : _.uniqBy([...this.state.data, ...temp], 'id'),
                offset: flag == false ? 1 : (this.state.offset + 1)
              })
            }
          },
            error => {
              this.setState({ isLoading: false })
              console.log({ error });
            }
          );
        } else {
          response.data.map(i => {
            tempMembers.length > 0 && tempMembers.map(item => {
              if (item.account?.id === i.account?.id) {
                i['added'] = true;
              } else {
                i['added'] = false;
              }
            })
          })
          this.setState({
            data: flag == false ? response.data : _.uniqBy([...this.state.data, ...response.data], 'id'),
            offset: flag == false ? 1 : (this.state.offset + 1)
          })
        }
      } else {
        this.setState({
          data: flag == false ? [] : this.state.data,
          offset: flag == false ? 0 : this.state.offset
        })
      }
    },
      error => {
        this.setState({ isLoading: false })
        console.log({ error });
      }
    );
  }

  addMember = () => {
    this.props.state.tempMembers.length > 0 && this.props.state.tempMembers.map((item, index) => {
      let parameter = {
        messenger_group_id: this.props.navigation?.state?.params?.addMember,
        account_id: item.account?.id,
        status: 'MEMBER'
      }
      this.setState({ isLoading: true })
      Api.request(Routes.messengerMembersCreate, parameter, response => {
        this.setState({ isLoading: false })
        if (response.data !== null) {
          this.props.navigation.navigate('messagesStack', {
            data: this.props.navigation.state?.params?.data
          });
          this.props.setTempMembers([]);
        }
      });
    },
      error => {
        this.setState({ isLoading: false })
        console.log({ error });
      }
    );
  }

  render() {
    const { theme } = this.props.state;
    return (
      <View style={{
        flex: 1,
        backgroundColor: Color.containerBackground
      }}>
        <ScrollView style={{
          backgroundColor: Color.containerBackground,
          marginBottom: 50
        }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <View style={Style.TextContainer}>
              <TextInput
                style={[
                  BasicStyles.formControl, {
                    borderColor: Color.gray,
                    borderWidth: .3
                  }
                ]}
                onChangeText={(search) => this.setState({ search: search })}
                value={this.state.search}
                placeholder={'Search Connections'}
                placeholderTextColor={'#d1d1d1'}
              />
            </View>
            {this.state.data.length > 0 && (<View>
              <CardList loading={() => { this.loading }} search={this.state.search} navigation={this.props.navigation} data={this.state.data} invite={true} hasAction={false} actionType={'button'} actionContent={'text'}></CardList>
            </View>)}
          </View>
        </ScrollView>
        {this.state.isLoading ? <Spinner mode="overlay" /> : null}
        {this.props.navigation?.state?.params?.addMember && <View style={{
          padding: 25,
          textAlign: 'center',
          justifyContent: 'center',
          paddingTop: 50,
          backgroundColor: Color.containerBackground
        }}>
          <CustomizedButton onClick={() => { this.addMember() }} title={'Add member/s'}></CustomizedButton>
        </View>}
        {/* <Footer layer={1} {...this.props}/> */}
      </View>
    );
  }
}
const mapStateToProps = state => ({ state: state });

const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux');
  return {
    viewMenu: (isViewing) => dispatch(actions.viewMenu(isViewing)),
    setTempMembers: (tempMembers) => dispatch(actions.setTempMembers(tempMembers))
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps)(Connections);
