import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-floorplan',
  templateUrl: './floorplan.component.html',
  styleUrls: ['./floorplan.component.scss']
})
export class FloorplanComponent implements OnInit {
  @Input("data") floorPlanImageUrl: any;
  @Input("pageType") pageType: string;
  
  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  removeFloorplanImage() {
    this.floorPlanImageUrl = null;
    let imageUpload = document.getElementById('imageUpload');
    if (imageUpload) (imageUpload as HTMLInputElement).value = '';
    this.cdRef.markForCheck();
  }

  imageUrl: any = '';
  uploadFloorplan(event) {
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];
    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
    }
    // When file uploads set it to file formcontrol
    reader.onload = () => {
      // this.imageUrl = reader.result;
      this.floorPlanImageUrl = reader.result;
      // console.log(reader.result);
      // console.log(this.imageUrl);
      // console.log("this.floorPlanImageUrl", this.floorPlanImageUrl);
    };
    // ChangeDetectorRef since file is loading outside the zone
    this.cdRef.markForCheck();
  }

  createFloorPlan() {
    
  }
}
