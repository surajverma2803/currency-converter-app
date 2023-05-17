import React, {useEffect, useState} from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  FlatList
} from 'react-native';
import axios from 'axios';
import {LineChart} from 'react-native-charts-wrapper';
const winWindth = Dimensions.get('window').width;
const winHeight = Dimensions.get('window').height;
let arr=[]
const App = () => {
  const [currencyList, setCurrencyList] = useState([]);
  const [open, setOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const [sourceAmount, setSourceAmount] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('');
  const [currencyData, setCurrencyData] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setloading] = useState(false);

  const currencyConverterHost = 'https://api.frankfurter.app';

  const fetchCurrencyLatest = () => {
    axios
      .get(`${currencyConverterHost}/latest`)
      .then(res => {
        setCurrencyList(Object.keys(res.data.rates));
      })
      .catch(e => {
        console.log('e', e);
      });
  };

  const convertCurrency = (amount, sourceCurrency, targetCurrency) => {
    if (amount && sourceCurrency && targetCurrency) {
      setloading(true);
      axios
        .get(
          `${currencyConverterHost}/latest?amount=${amount}&from=${sourceCurrency}&to=${targetCurrency}`,
        )
        .then(res => {
          setTargetAmount(Object.values(res.data.rates));
          setloading(false);
          currencyGraph();
          arr.push({from:sourceCurrency,to:targetCurrency})
          setList(arr)
        })
        .catch(e => {
          Alert.alert('Something went wrong', `${e?.message}`, [{text: 'OK'}]);
          setloading(false);
        });
    } else {
      Alert.alert('Wrong Input', 'Enter All given values correctly', [
        {text: 'OK'},
      ]);
    }
  };

  const currencyGraph = () => {
    if (sourceCurrency && targetCurrency) {
      axios
        .get(
          `${currencyConverterHost}/2023-04-01..?from=${sourceCurrency}&to=${targetCurrency}`,
        )
        .then(resp => {
          const data = Object.values(resp.data.rates).map(i => {
            return Object.values(i)[0];
          });
          setCurrencyData(data);
        })
        .catch(e => {
          console.log('e', e);
        });
    } else {
      Alert.alert('Wrong Input', 'Enter All given values correctly', [
        {text: 'OK'},
      ]);
    }
  };

  useEffect(() => {
    fetchCurrencyLatest();
    // currencyGraph();
  }, []);

  return (
    <View style={styles.mainContainer}>
        <Text style={styles.title}>Currency Converter</Text>
        <View>
          <Text style={{color:"black",fontSize:15}}>Search History</Text>
          <FlatList
          horizontal
          data={list}
          renderItem={({item})=>(
            <TouchableOpacity style={{backgroundColor:'white',padding:11,margin:11,borderRadius:11}}
            onPress={()=>{
              setSourceCurrency(item?.from)
              setTargetCurrency(item?.to)
            }}
            >
              <Text style={{color:'black'}}>{item?.from} & {item?.to}</Text>
              </TouchableOpacity>
          )}
          />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View>
              <Text style={styles.heading}>From</Text>
              <DropDownPicker
                style={styles.drop}
                onChangeText={value => setSourceCurrency(value)}
                open={open}
                value={sourceCurrency}
                items={currencyList.map(currency => ({
                  label: currency,
                  value: currency,
                }))}
                setOpen={setOpen}
                setValue={setSourceCurrency}
                maxHeight={140}
                textStyle={{fontSize: 18}}
                labelStyle={{color: 'black', fontWeight: 'bold'}}
                placeholder="Select"
                dropDownContainerStyle={{borderWidth: 0}}
                />
            </View>
            <View>
              <Text style={styles.heading}>To</Text>
              <DropDownPicker
                style={[styles.drop, {marginBottom: '5%'}]}
                onChangeText={value => setTargetCurrency(value)}
                open={targetOpen}
                value={targetCurrency}
                items={currencyList.map(currency => ({
                  label: currency,
                  value: currency,
                }))}
                setOpen={setTargetOpen}
                setValue={setTargetCurrency}
                labelStyle={{color: 'black', fontWeight: 'bold'}}
                textStyle={{fontSize: 18}}
                maxHeight={140}
                placeholder="Select"
                dropDownContainerStyle={{borderWidth: 0}}
              />
            </View>
          </View>
        </View>
          <ScrollView>
        <View>
          {loading ? <ActivityIndicator color="#000000" size="large" /> : null}
          <View
            style={{
              marginTop: 21,
              padding: 12,
              backgroundColor: '#38CC77',
              borderRadius: 11,
            }}
            onPress={() =>
              convertCurrencyAPI(sourceAmount, sourceCurrency, targetCurrency)
            }>
            <View>
              <Text style={styles.heading}>Enter Amount</Text>
              <TextInput
                style={styles.textInput}
                onChangeText={value => setSourceAmount(value)}
                value={sourceAmount}
                placeholder={'Enter Value'}
                keyboardType="decimal-pad"
              />
              <Text style={styles.result}>{targetAmount}</Text>
            </View>
            <TouchableOpacity
              style={{
                marginTop: 2,
                padding: 12,
                backgroundColor: '#38CC77',
                borderRadius: 11,
              }}
              onPress={() =>
                convertCurrency(sourceAmount, sourceCurrency, targetCurrency)
              }>
              <Text
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#ffff',
                  fontSize: 22,
                }}>
                Get Exchange Rate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View>
          <Text style={{marginVertical:11,fontWeight:"300",color:"black"}}>Currency Chart :</Text>
          {currencyData[0] ? (
            <>
          <View style={{backgroundColor:"orange",padding:11,borderRadius:31}}>
                      <LineChart style={{flex:1,width:"100%",height:250}}
                      data={{
                        dataSets: [
                          {
                              values: currencyData
                          },
                        ]
                      }}
                      
                    />
                    </View>  
                    </>        
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 20,
    // height: 700,
    backgroundColor: '#CAD5E2',
    // justifyContent:'space-evenly'
  },
  textInput: {
    marginBottom: 10,
    backgroundColor: 'white',
    color: 'green',
    borderRadius: 8,
    paddingHorizontal: 11,
    fontSize: 18,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 30,
    alignSelf: 'center',
    // paddingHorizontal:'1%',
    // backgroundColor:'#FF6666',
    borderRadius: 61,
    paddingVertical: '1%',
    marginBottom: '2%',
  },
  heading: {
    fontSize: 19,
    color: 'black',
    marginVertical: 11,
  },
  result: {
    fontSize: 20,
    color: '#ffff',
    marginVertical: 11,
    fontWeight: '600',
  },
  drop: {
    backgroundColor: 'white',
    width: winWindth / 2.3,
    borderWidth: 0,
  },
});

export default App;
