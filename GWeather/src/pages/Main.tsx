import { IonButtons, IonCard, IonCardTitle, IonContent, IonHeader, IonItem, IonLabel, IonMenu, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import './Main.css';

import localeList from '../data/localeList.json';

import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import axios, { AxiosResponse } from 'axios';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';

import WeatherCard from '../components/WeatherCard';






const Main: React.FC = () => {

  //hooks
  const [data, setData] = useState<any>([]);
  const [menu, setMenu] = useState<any[]>([]);

  const [day1, setDay1] = useState("");
  const [day2, setDay2] = useState("");
  const [day3, setDay3] = useState("");

  const [w1, setForecast1] = useState("");
  const [w2, setForecast2] = useState("");
  const [w3, setForecast3] = useState("");


  const [locality, setLocality] = useState("");

  const [initDone, setInit] = useState(false); 

  const { selectedLoc } = useParams<{selectedLoc: string}>();

  const apiURL = "https://api.open-meteo.com/v1/forecast?"; //weather api



  //initializer
  useEffect(() => {

    //load the local data
    const dbName = 'LocaleDisplay';
    const objsName = 'LDStorage';

    let db: IDBDatabase;

    const request = indexedDB.open(dbName);


    request.onerror = (ev) => { 
      console.error("DB OPEN FAILED"); 
    }

    request.onupgradeneeded = (e) => {

      db = request.result;

      const newObjectStore = db.createObjectStore(objsName, {keyPath: "location" });
      newObjectStore.transaction.oncomplete = (e) => { 

      const requestNew = db.transaction(objsName, "readwrite").objectStore(objsName);
      requestNew.add({location: "New York", default: true });
      requestNew.add({location: "London", default: false });
      requestNew.add({location: "Seoul", default:false})
      }
    }

    request.onsuccess = (e) => {

      db = request.result;  

      const requestGetAll = db.transaction(objsName, "readwrite").objectStore(objsName).getAll();
      requestGetAll.onsuccess = (e2) => {

        const localStorageOutput = requestGetAll.result;  

        //prepare data for UI:
        //MENU ITEMS
        const menuLocales = localeList.filter( loc => {
          return localStorageOutput.find(approved => { return approved.location === loc.location; });
        });
        setMenu(menuLocales);


        //CURRENT LOCALE
        //get it from useParam if provided; otherwise, use default
        const current = selectedLoc ? selectedLoc : localStorageOutput.find(entry => entry.default === true).location;

        setLocality(current);


        //API DATA
        callAPI4Data(menuLocales, current);

        setInit(true);

      }; 

    }

  }, []);


  useEffect(()=>{

    //reflect the link change after the initial load
    if(initDone === true){

      setLocality(selectedLoc);
      callAPI4Data(menu, selectedLoc);

    }
    
  }, [selectedLoc])



  function callAPI4Data(menuData: any[], target: string){

    const localeInfo = menuData.find(entry => entry.location === target);

    let dt = new Date();
    let today = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
    let dayAfterTomorrow = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + (dt.getDate() + 2);


    const fullURL = apiURL + "latitude=" + localeInfo?.latitude + "&longitude=" + localeInfo?.longitude 
                        + "&daily=weathercode&current_weather=true&timezone=" + localeInfo?.timezone
                        + "&start_date=" + today
                        + "&end_date=" + dayAfterTomorrow;


    axios.get(fullURL)
    .then((urlResponse: AxiosResponse<any>) => {
      setData(urlResponse.data);

      let fdays = urlResponse.data.daily.time;
      setDay1(fdays.at(0));
      setDay2(fdays.at(1));
      setDay3(fdays.at(2));

      let wReports = urlResponse.data.daily.weathercode;
      setForecast1(wReports.at(0).toString());
      setForecast2(wReports.at(1).toString());
      setForecast3(wReports.at(2).toString());
    })
    .catch(error => console.error(`ERROR OCCURRED: ${error}`)); 

  }



  return (
    <>
    <IonMenu contentId="menu-target">

      <IonHeader>
        <IonToolbar>
          <IonTitle>G-WEATHER</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {menu.map((menuItem, index) => (
          <IonItem key={index} routerLink={"/main/" + menuItem.location}>
            <IonLabel>{menuItem.location}</IonLabel>
          </IonItem>
        ))}
      </IonContent>

    </IonMenu>


    <IonPage id="menu-target">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton></IonMenuButton></IonButtons>
          <IonTitle>{locality}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        <Swiper
          slidesPerView={1}
          allowTouchMove={true}
          allowSlideNext={true}
          allowSlidePrev={true}
          modules={[Pagination]}
          pagination={{ clickable: true }}
        >
          
          <SwiperSlide><WeatherCard givenDate={day1} wcode={w1} /></SwiperSlide>
          <SwiperSlide><WeatherCard givenDate={day2} wcode={w2} /></SwiperSlide>
          <SwiperSlide><WeatherCard givenDate={day3} wcode={w3} /></SwiperSlide>

        </Swiper>

      </IonContent>
    </IonPage>

    </>
  );
};

export default Main;
