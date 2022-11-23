import { Component, Input, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-exhibitor',
  templateUrl: './exhibitor.component.html',
  styleUrls: ['./exhibitor.component.scss']
})
export class ExhibitorComponent implements OnInit {

  @Input() tableData;
  @Input() isReadMode;
  editIndex = null;
  data = [
  ];
  columns = [
    'Org_Id',
    'Exhibitor_ID',
    'Company_Name',
    'Contract_num',
    'Primary_Contact_Email_Address',
    'Address1',
    'Address2',
    'City',
    'State',
    'Postal_Code',
    'Country',
    'Phone_Number',
    'Fax',
    'Allotment'
  ];
  allColumns = [...this.columns, 'Booth_Number','Booth_Square_Footage','Booth_Dimensions','Primary_Contact_First_Name','Primary_Contact_Last_Name','Primary_Contact_Title','Address3','Company_Website_URL','Membership_Status','Exhibiting_Method','Blocklisting','Blockbooth','MediaDays'];
  readonlyColumns = ['Exhibitor_ID', 'Org_Id'];
  intColumns = ['Org_Id','Contract_num', 'Booth_Number','Booth_Square_Footage', 'Allotment','Postal_Code','Phone_Number','Membership_Status','Blocklisting'];
  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.data = this.tableData.slice();
  }

  ngOnInit(): void {}
  setHeader(title, index) {
    return title.toUpperCase();
  }
  removeAll(): void{
    this.data = [];
  }

  delteRowAtIndex(index){
    this.data.splice(index,1);
    this.editIndex = null;
  }

  public getExhibitorData(){
    return this.data.map( row => {
      this.intColumns.forEach( column => row[column] = this.convertToInt(row[column]) )
      return row;
    })
  }

  convertToInt(val){
    return isNaN(parseInt(val)) ? 0: parseInt(val)
  }

  
  submit(){
    console.log(this.data);
  }

  addNewRow(){
    let newObj= {};
    this.allColumns.forEach(column => {
      newObj[column] = '';
    })
    newObj['Exhibitor_ID'] = "XXX"+this.data.length+1111;
    newObj['Org_Id'] = this.data.length+723451;
    
    this.data.unshift(newObj);
    this.editIndex = 0;
  }

  trackByItemId(index, item){
    return index;
  }

}