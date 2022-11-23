import { Component, OnInit } from '@angular/core';
import { ReportService } from '../services/report.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-legacy-reports',
  templateUrl: './legacy-reports.component.html',
  styleUrls: ['./legacy-reports.component.scss']
})
export class LegacyReportsComponent implements OnInit {
  legacyReports =[
    {
      Id: 'e838d51bb21',
      devId: '4f003c15a5c',
      reportName: 'Event Metrıcs Report',
      reportNameLink: 'Event_Metrics',
      devReportNameLink: 'Event_Metrics_dev',
      lastEditedUser: 'Ravi Surapur',
      lastEditedDate: '1/1/2022'
    },
    {
      Id: 'f7025294828',
      devId: '656a236265e',
      reportName: 'Session and Event Summary Report',
      reportNameLink: 'Session%20and%20Event%20Summary%20Report',
      devReportNameLink: 'Session%20and%20Event%20Summary%20Report_dev',
      lastEditedUser: 'Ravi Surapur',
      lastEditedDate: '1/1/2022'
    },
    {
      Id: 'd60f90173c0',
      devId: '9dbcb71ff9d',
      reportName: 'Geographıcal Dıstrıbutıon Report',
      reportNameLink: 'Geographical%20Distribution%20Summary',
      devReportNameLink: 'Geographical%20Distribution%20Summary_dev',
      lastEditedUser: 'Ravi Surapur',
      lastEditedDate: '1/1/2022'
    },
    {
      Id: '203e793a404',
      devId: '47a0588c375',
      reportName: 'Registrant Profile Report',
      reportNameLink: 'Registrant%20Profile%20Summary',
      devReportNameLink: 'Registrant%20Profile%20Summary_Dev',
      lastEditedUser: 'Ravi Surapur',
      lastEditedDate: '1/1/2022'
    },
    {
      Id: 'a1bc6e08110',
      devId: '0d1ca14481b',
      reportName: 'Registrant Attendance Report',
      reportNameLink: 'Registration%20Attendance%20Summary',
      devReportNameLink: 'Registration%20Attendance%20Summary_dev',
      lastEditedUser: 'Ravi Surapur',
      lastEditedDate: '1/1/2022'
    },
    {
      Id: 'b47db8e170f',
      devId: 'b47db8e170f',
      reportName: 'Exhibitor Dashboard',
      reportNameLink: 'Exhibitor%20Dashboard_dev',
      devReportNameLink: 'Exhibitor%20Dashboard_dev',
      lastEditedUser: 'Ravi Surapur',
      lastEditedDate: '1/1/2022'
    }
  ];


  constructor(private reportService: ReportService,) { }

  ngOnInit(): void {
    const username: string = localStorage.getItem("username");
    const password: string = localStorage.getItem("password");
    this.reportService.reportUserLogin(username, password).then((token: any[]) => {
      if (token) {
      }
    }).catch(error => {
      console.error(error);
    });
  }

  export(report: any, exportType: string) {
    this.reportService.exportReport(environment.production?report.Id:report.devId, exportType).then((documentLink: string) => {
      const a = document.createElement('a')
      a.href = documentLink
      a.click();
      URL.revokeObjectURL(documentLink);
    }).catch(error => {
      if (!error) {
        console.error("Failed to export the report.");
      }
    });
  }

  live(report: any) {
    const previewLink = `/tlkreportviewer/${environment.production? report.reportNameLink:report.devReportNameLink}?evtuid=undefined`;
    window.open(previewLink,'_blank');
  }

}
