import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { API_URL2 } from 'src/app/services/url/url';
import { environment } from 'src/environments/environment';
import { builderTemplate } from './builderTemplate';
import { EnableFlowpageComponent } from '../../modals/enable-flowpage/enable-flowpage.component';

const projectId: string = environment.production
  ? 'csi-event-a3367'
  : 'test-csi-event';
  
var headers = new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Headers', 'Content-Type')
  .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  .set('Access-Control-Allow-Origin', '*');

@Component({
  selector: 'app-page-builder',
  templateUrl: './page-builder.component.html',
  styleUrls: ['./page-builder.component.scss']
})
export class PageBuilderComponent implements OnInit {
  @Input("pageType") pageType: string;
  @Input("savedTemplateList") savedTemplateList: any[];
  @Input("addUserid") addUserid: string;
  @Input("builderUrl") builderUrl: string;
  @Input("builderSelection") builderSelection: string;
  @Input("builderIOID") builderIOID: string;
  @Input("exhibitorSelection") exhibitorSelection: string;
  @Input("exhibitorIOID") exhibitorIOID: string;
  @Input("organizerSelection") organizerSelection: string;
  @Input("organizerIOID") organizerIOID: string;
  @Input("commanderSelection") commanderSelection: string;
  @Input("commanderIOID") commanderIOID: string;
  @Input("eventPortalSelection") eventPortalSelection: string;
  @Input("eventPortalIOID") eventPortalIOID: string;
  @Input("regtypesList") regtypesList: any[];
  @Input("pageBuilderLaunched") pageBuilderLaunched: Boolean;

  selectedTemplate;
  newPaperBits: any;
  originalBuilderSelection = null;
  originalExhibitorSelection = null;
  originalOrganizerSelection = null;
  originalCommanderSelection = null;
  originalEventPortalSelection = null;
  originalBuilderIOID: string;
  originalExhibitorIOID: string;
  originalOrganizerIOID: string;
  originalCommanderIOID: string;
  originalEventPortalIOID: string;
  builderJson: string = "";
  exhibitorJson: string = "";
  organizerJson: string = "";
  commanderJson: string = "";
  eventPortalJson: string = "";
  originalBuilderJson: string = "";
  originalExhibitorJson: string = "";
  originalOrganizerJson: string = "";
  originalCommanderJson: string = "";
  originalEventPortalJson: string = "";
  errorCode: String;

  /** New Variables */
  categoriesList: string[] = [
    'Attendee',
    'Exhibitor',
    'Organizer',
    'Commander',
    'Event Portal'
  ];
  selectedCategory: string = this.categoriesList[0];
  builderTemplate: any[] = builderTemplate;

  constructor(
    private localStorageService: LocalStorageService,
    public toastService: ToastService,
    private httpClient: HttpClient,
    private modalService: NgbModal,
  ) {
    if (localStorage.getItem("Authorization")) {
      headers = new HttpHeaders()
      .set('content-type', 'application/json')
      .set('Access-Control-Allow-Headers', 'Content-Type')
      .set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .set('Access-Control-Allow-Origin', '*')
      .set('Authorization', localStorage.getItem("Authorization"));
    }
  }

  ngOnInit(): void {
    this.originalBuilderIOID = this.builderIOID;
    this.originalExhibitorIOID = this.exhibitorIOID;
    this.originalOrganizerIOID = this.organizerIOID;
    this.originalCommanderIOID = this.commanderIOID;
    this.originalEventPortalIOID = this.eventPortalIOID;
    this.originalBuilderSelection = this.builderSelection;
    this.originalExhibitorSelection = this.exhibitorSelection;
    this.originalOrganizerSelection = this.organizerSelection;
    this.originalCommanderSelection = this.commanderSelection;
    this.originalEventPortalSelection = this.eventPortalSelection;

    /** Set the checked and img value in edit event */
    if (this.savedTemplateList?.length > 0) {
      this.builderTemplate = this.savedTemplateList?.map((template: any) => {
        return {
          ...template,
          templateId: template.templateId ? template.templateId : builderTemplate?.find((t: any) => t.templateName === template.templateName && t.json === template.json)?.templateId,
          checked: template.checked === true || template.checked === "true" ? true : false,
          img: builderTemplate.find((temp: any) => temp.json === template.json)?.img,
          pages: template.pages? template.pages:this.builderTemplate.find((temp: any) => temp.json === template.json)?.pages,
        };
      });
      this.builderTemplate.forEach((template: any) => {
        if (template.checked === true) {
          switch (template.templateType) {
            case this.categoriesList[0]:
              this.originalBuilderJson = template.json;
              this.builderJson = template.json;
              break;
            case this.categoriesList[1]:
              this.originalExhibitorJson = template.json;
              this.exhibitorJson = template.json;
              break;
            case this.categoriesList[2]:
              this.originalOrganizerJson = template.json;
              this.organizerJson = template.json;
              break;
            case this.categoriesList[3]:
              this.originalCommanderJson = template.json;
              this.commanderJson = template.json;
              break;              
            case this.categoriesList[4]:
              this.originalEventPortalJson = template.json;
              this.eventPortalJson = template.json;
              break;              
            default:
              break;
          }
        }
      });
    }

    /** Launch default workflows in create event */
    const defaultSelectWorkflows: string[] = ["attendee-workflow-1.json", "exhibitor-workflow-1.json", "organizer-workflow-1.json", "commander-portal.json", "event-portal.json"];
    const isLauchDefaultpaperbits: boolean = this.builderTemplate.every((template: any) => template.checked !== true);
    if (this.pageType === 'create' && isLauchDefaultpaperbits) {
      this.builderTemplate.forEach((template, i) => {
        if (defaultSelectWorkflows.includes(template.json)) {        
          template.checked === true;
          this.launchPaperBits(template.json, template.url, i);

          //set initial regtyp
          if (template.templateType==="Attendee") {
            let regList: string[] = this.regtypesList.map(el => el.code + ' - ' + el.description);
            let initial_regtype = "";
            template.pages.forEach(el => {
              if (el.page === 'initial_regtype') {
                initial_regtype = el.displayName;
              }
            });
            if (!initial_regtype) {
              initial_regtype = regList?.length>0? regList[0]: '';

              const idx = template.pages.findIndex(el => el.page === 'initial_regtype');
              if (idx > -1) {
                template.pages[idx].displayName = initial_regtype;
              } else {
                template.pages.push({page: 'initial_regtype', displayName: initial_regtype, enable: true});
              }
            }
          }
        }
      });
    }

    /** Set the selected template */
    this.builderTemplate.forEach((template: any) => {
      if (template.templateType === this.selectedCategory && template.checked === true) {
        this.selectedTemplate = template;
      }
    });
  }

  changeTemplate(e: any, template: any, index: number) {
    this.builderTemplate[index].checked = e.target.checked;
    if (e.target.checked === true) {
      this.selectedTemplate = template;
      this.launchPaperBits(template.json, template.url, index);
    }
  }

  private openOriginalBuilderUrl(orgIOID, orgBuilderSelection) {
    if (orgBuilderSelection.includes('commander')) return;
    if (orgBuilderSelection.includes('event-portal')) return;

    if (!this.addUserid) {
      this.toastService.show('Username does not exist. Please login again.', {
        delay: 6000,
        classname: 'bg-warning text-dark',
        headertext: 'Warning',
        autohide: true,
      });
      return false;
    }
    this.builderUrl = environment.PAPERBITS_URL + '/' + this.addUserid + '/' + orgIOID + orgBuilderSelection;
    console.log(this.builderUrl);
    this.pageBuilderLaunched = true;
    window.open(this.builderUrl, '_blank');
  }

  private openBuilderUrl(IOId, userName?, url?) {
    if (url?.includes('commander')) return;

    if (!IOId) {
      alert("The guid does not existing");
      return false;
    }
    if (!url) url = this.builderSelection;
    this.builderUrl = environment.PAPERBITS_URL + '/' + userName + '/' + IOId + url;
    console.log(this.builderUrl);
    this.pageBuilderLaunched = true;
    window.open(this.builderUrl, '_blank');
  }

  changeCategory(category: any) {
    this.selectedCategory = category;
    this.builderTemplate.forEach((template: any) => {
      if (template.templateType === this.selectedCategory && template.checked === true) this.selectedTemplate = template;
    });
  }

  changeSelectedTemplate(i: number) {
    this.builderTemplate.forEach((template: any) => {
      if (template.templateType === this.selectedCategory) template.checked = false
    });
    this.builderTemplate[i].checked = true;
    if (this.builderTemplate[i].checked === true) {
      this.selectedTemplate = this.builderTemplate[i];
      let selectedType = this.selectedTemplate?.templateType;
      switch(selectedType) {
        case "Attendee":
          if (
            this.originalBuilderSelection === this.selectedTemplate.url &&
            this.originalBuilderIOID &&
            this.originalBuilderJson === this.selectedTemplate.json
          ) {
            this.builderSelection = this.originalBuilderSelection;
            this.builderIOID = this.originalBuilderIOID;
            this.builderJson = this.originalBuilderJson;
          } else {
            this.builderSelection = null;
            this.builderIOID = null;
          }
          break;
        case "Exhibitor":
          if (
            this.originalExhibitorSelection === this.selectedTemplate.url &&
            this.originalExhibitorIOID &&
            this.originalExhibitorJson === this.selectedTemplate.json
          ) {
            this.exhibitorSelection = this.originalExhibitorSelection;
            this.exhibitorIOID = this.originalExhibitorIOID;
            this.exhibitorJson = this.originalExhibitorJson;
          } else {
            this.exhibitorSelection = null;
            this.exhibitorIOID = null;
          }
          break;
        case "Organizer":
          if (
            this.originalOrganizerSelection === this.selectedTemplate.url &&
            this.originalOrganizerIOID &&
            this.originalOrganizerJson === this.selectedTemplate.json
          ) {
            this.organizerSelection = this.originalOrganizerSelection;
            this.organizerIOID = this.originalOrganizerIOID;
            this.organizerJson = this.originalOrganizerJson;
          } else {
            this.organizerSelection = null;
            this.organizerIOID = null;
          }
          break;
        default:
          break;
      }

      //set initial regtyp
      if (this.selectedTemplate.templateType==="Attendee") {
        let regList: string[] = this.regtypesList.map(el => el.code + ' - ' + el.description);
        let initial_regtype = "";
        this.selectedTemplate.pages.forEach(el => {
          if (el.page === 'initial_regtype') {
            initial_regtype = el.displayName;
          }
        });
        if (!initial_regtype) {
          initial_regtype = regList?.length>0? regList[0]: '';

          const idx = this.selectedTemplate.pages.findIndex(el => el.page === 'initial_regtype');
          if (idx > -1) {
            this.selectedTemplate.pages[idx].displayName = initial_regtype;
          } else {
            this.selectedTemplate.pages.push({page: 'initial_regtype', displayName: initial_regtype, enable: true});
          }
        }
      }

    }
  }

  public launchPaperBits(jsonValue, url, i) {
    let selectedType = this.builderTemplate[i]?.templateType;
    /** Check if the url is new with builderSelection and launch the paperbits */
    if (
      selectedType == 'Attendee' &&
      this.originalBuilderSelection === url &&
      this.originalBuilderIOID &&
      this.originalBuilderJson === jsonValue
    ) {
      this.openOriginalBuilderUrl(this.builderIOID, this.builderSelection);
      return;
    }
    if (
      selectedType == 'Exhibitor' &&
      this.originalExhibitorSelection === url &&
      this.originalExhibitorIOID &&
      this.originalExhibitorJson === jsonValue
    ) {
      this.openOriginalBuilderUrl(this.exhibitorIOID, this.exhibitorSelection);
      return;
    }
    if (
      selectedType == 'Organizer' &&
      this.originalOrganizerSelection === url &&
      this.originalOrganizerIOID &&
      this.originalOrganizerJson === jsonValue
    ) {
      this.openOriginalBuilderUrl(this.organizerIOID, this.organizerSelection);
      return;
    }
    if (
      selectedType == 'Commander' &&
      this.originalCommanderSelection === url &&
      this.originalCommanderIOID &&
      this.originalCommanderJson === jsonValue
    ) {
      this.openOriginalBuilderUrl(this.commanderIOID, this.commanderSelection);
      return;
    }

    if (
      selectedType == 'Event Portal' &&
      this.originalEventPortalSelection === url &&
      this.originalEventPortalIOID &&
      this.originalEventPortalJson === jsonValue
    ) {
      this.openOriginalBuilderUrl(this.eventPortalIOID, this.eventPortalSelection);
      return;
    }

    console.log('index: ', i);
    this.builderTemplate = this.builderTemplate?.map((template, index) => {
      if (template.templateType == selectedType && index == i) {
        return {
          ...template,
          checked: true,
        };
      } else if (template.templateType != selectedType) {
        return template;
      }
      return {
        ...template,
        checked: false,
      };
    });
    console.log('launchPaperBits parameters', jsonValue, url);

    // var userId = localStorage.getItem('userId');
    var userName = this.localStorageService.get('username');
    if (!userName) {
      this.toastService.show('Username does not exist. Please login again.', {
        delay: 6000,
        classname: 'bg-warning text-dark',
        headertext: 'Warning',
        autohide: true,
      });
      return false;
    }

    var PAPBERBITS_SERVICE_API = API_URL2 + '/csi/event/services/eventSetupV2/paperBitsDBInit';

    this.newPaperBits = {
      projectId: projectId,
      clientName: userName,
      json: jsonValue,
    };

    if (jsonValue === '') {
      delete this.newPaperBits.json;
    }

    console.log(this.newPaperBits);

    /** Set the builder Selection from the builderTemplate url */
    if (selectedType == 'Attendee') {
      this.builderSelection = url;
    } else if (selectedType == 'Exhibitor') {
      this.exhibitorSelection = url;
    } else if (selectedType == 'Organizer') {
      this.organizerSelection = url;
    } else if (selectedType == 'Commander') {
      this.commanderSelection = url;
    } else if (selectedType == 'Event Portal') {
      this.eventPortalSelection = url;
    }

    this.httpClient
      .post<any>(PAPBERBITS_SERVICE_API, this.newPaperBits, { headers })
      .pipe(
        finalize(() => {
        })
      )
      .subscribe(
        (data) => {
          console.log(PAPBERBITS_SERVICE_API);
          console.log(data);

          if (data['response'].invalidProperty !== undefined) {
            this.errorCode = data['response'].invalidProperty;
            alert('An error occurred' + this.errorCode);
          } else if (data['response']?.result === "failed") {
            alert('PaperbitsDBInit Failed');
          } else {
            console.log('success');
            this.errorCode = null;
            if (selectedType == 'Attendee') {
              this.builderIOID = data['response']['guid'];
              this.builderJson = jsonValue;
              this.openBuilderUrl(this.builderIOID, userName, url);
            } else if (selectedType == 'Exhibitor') {
              this.exhibitorIOID = data['response']['guid'];
              this.exhibitorJson = jsonValue;
              this.openBuilderUrl(this.exhibitorIOID, userName, url);
            } else if (selectedType == 'Organizer') {
              this.organizerIOID = data['response']['guid'];
              this.organizerJson = jsonValue;
              this.openBuilderUrl(this.organizerIOID, userName, url);
            } else if (selectedType == 'Commander') {
              this.commanderIOID = data['response']['guid'];
              this.commanderJson = jsonValue;
              this.openBuilderUrl(this.commanderIOID, userName, url);
            } else {
              this.eventPortalIOID = data['response']['guid'];
              this.eventPortalJson = jsonValue;
              this.openBuilderUrl(this.eventPortalIOID, userName, url);
            }
          }
        },
        (error) => {
          const errorMessage = `Launching your page builder failed. Error -  ${error.message}`;
          alert(errorMessage);
          console.log(error);
        }
      );
  }

  openPaperbits() {
    const selectedIndex: number = this.builderTemplate.findIndex((template: any) => template.json == this.selectedTemplate.json);
    this.launchPaperBits(this.selectedTemplate.json, this.selectedTemplate.url, selectedIndex);
  }

  configureWorkflow(idx: number) {
    console.log(this.builderTemplate)
    this.selectedTemplate = this.builderTemplate[idx];

    const createQuestionModalRef = this.modalService.open(EnableFlowpageComponent, {
      size: 'lg',
      windowClass: 'modal-enable-flowpage'
    });
    createQuestionModalRef.componentInstance._template = this.selectedTemplate;
    createQuestionModalRef.componentInstance.regtypesList = this.regtypesList;
    createQuestionModalRef.result.then((updated: any) => {
      console.log("updated: ", updated);
      if (!updated) {
        return;
      }
      this.builderTemplate[idx] = updated;
      console.log(this.builderTemplate)
    }).catch((err: Error) => {
      console.error("close error: ", err);
    });
  }
}
