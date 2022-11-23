import { Component, OnInit, Directive, ElementRef } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
@Pipe({
  name: 'byPassSecurity'
})
export class ByPassSecurityPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
@Directive({ selector: '[runScripts]' })
export class RunScriptsDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}
  ngOnInit(): void {
    setTimeout(() => {
      // wait for DOM rendering
      this.reinsertScripts();
      // this.resizeInputs();
    });
  }
  reinsertScripts(): void {
    const scripts = <HTMLScriptElement[]>(
      this.elementRef.nativeElement.getElementsByTagName('script')
    );
    const scriptsInitialLength = scripts.length;
    for (let i = 0; i < scriptsInitialLength; i++) {
      const script = scripts[i];
      const scriptCopy = <HTMLScriptElement>document.createElement('script');
      scriptCopy.type = script.type ? script.type : 'text/javascript';
      if (script.innerHTML) {
        scriptCopy.innerHTML = script.innerHTML;
      } else if (script.src) {
        scriptCopy.src = script.src;
      }
      scriptCopy.async = false;
      script.parentNode.replaceChild(scriptCopy, script);
    }
  }
  resizeInputs(): void{
    const inputs = <HTMLInputElement[]>(
      this.elementRef.nativeElement.getElementsByTagName('input')
    );
    const inputsLength = inputs.length;
    for (let i = 0; i < inputsLength; i++){
      const input = inputs[i];
      const inputCopy = <HTMLInputElement>document.createElement('input'
                                                                );
      inputCopy.type = input.type;
      inputCopy.placeholder = input.placeholder;
      inputCopy.style.width = `${input.placeholder.length + 3 * 8}px`;
      input.parentNode.replaceChild(inputCopy, input);
    }
  }
}
@Component({
  selector: 'app-event-metrics',
  templateUrl: './event-metrics.component.html',
  styleUrls: ['./event-metrics.component.scss']
})
export class EventMetricsComponent implements OnInit {
  constructor(public http: HttpClient) {}

  eventMetricsURL = 'https://www.csi-event.com:8050/reports/event_metrics/1';
  // eventMetricsURL = "http://localhost:5000/reports/event_metrics/1";
  htmlString: any = '';
  ngOnInit(): void {
    this.changePage();
  }

  public changePage() {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain'
    });
    const request = this.http
      .get(this.eventMetricsURL , {
        headers: headers,
        responseType: 'text'
        // responseType: 'text'
      })
      .subscribe(res => {
        console.log('HERE');
        console.log(res);
        this.htmlString = res;
      });
  }
}
