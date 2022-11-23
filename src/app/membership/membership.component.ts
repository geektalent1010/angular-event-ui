import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-membership',
  templateUrl: './membership.component.html',
  styleUrls: ['./membership.component.scss']
})
export class MembershipComponent implements OnInit, OnChanges {
  @Input() tableData;
  @Input() isReadMode;
  editIndex = null;
  data = [
  ];
  columns = [
    'Member_ID',
    'First_Name',
    'Last_Name',
    'Company_Name',
    'Addr1',
    // 'Addr2',
    'City',
    'State_Code',
    'Postal_Code',
    'Country_Code',
    'Phone',
    'Preferred_Email_Address',
    'Member_Class_Code'
  ];
  allColumns = [...this.columns];
  intColumns = [];
  readonlyColumns = ['Member_ID'];
  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    this.data = this.tableData.slice();
  }

  ngOnInit(): void {}
  setHeader(title, index) {
    return title.toUpperCase();
  }

  removeAll(){
    this.data = [];
  }

  delteRowAtIndex(index){
    this.data.splice(index,1);
    this.editIndex = null;
  }

  public getMembershipData(){
    return this.data.map( row => {
      this.intColumns.forEach( column => row[column] = this.convertToInt(row[column]) )
      return row;
    })
  }

  convertToInt(val){
    return isNaN(parseInt(val)) ? 0: parseInt(val)
  }

  // public getMembershipDataForCreate(){
  //   return this.data.map( data => {
  //     data['Member_ID'] = null;
  //     return data;
  //   });
  // }

  submit(){
    console.log(this.data);
  }


  addNewRow(){
    let newObj= {};
    this.allColumns.forEach(column => {
      newObj[column] = '';
    })
    newObj['Member_ID'] = this.data.length+6000;
    this.data.unshift(newObj);
    this.editIndex = 0;
  }

  trackByItemId(index, item){
    return index;
  }
}