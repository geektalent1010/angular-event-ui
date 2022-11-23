import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-polling-questions',
  templateUrl: './polling-questions.component.html',
  styleUrls: ['./polling-questions.component.scss']
})
export class PollingQuestionsComponent implements OnInit {

  public passedId : String;
  public returnedData : []
  private REST_API_SERVER = "http://www.csi-event.com:8088/csi/event/services/analyticsServices/getMLRecommendationCustomQuery?recommendationNameAndParams=";

  constructor(private route: ActivatedRoute,  private httpClient: HttpClient) {

    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }

  }

  public sendGetRequest(){
    return this.httpClient.get(this.REST_API_SERVER, { headers });
  }
  ngOnInit(): void {
    this.passedId = this.route.snapshot.paramMap.get('id');

    this.REST_API_SERVER = this.REST_API_SERVER + this.passedId;
    console.log(this.REST_API_SERVER);

    /*this.sendGetRequest().subscribe((data: any[])=>{
      let myData = data.response;
      let returnCode = data['statusCode'];

      if (returnCode === 200) {

        console.log("Access Granted");
        console.log(myData);
        console.log(myData[0]["Recommendation"]);
        this.returnedData = myData[0]["Recommendation"];

      } else {
        console.log("An error has occured");
        console.log("-" + returnCode + "-");
      }

      });*/

  }

}
