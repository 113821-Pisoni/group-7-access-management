import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {Component, inject, Input, OnInit} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QrService, sendQRByEmailRequest } from '../../services/qr.service';
import { ConfirmAlertComponent , ToastsContainer, ToastService } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [FormsModule, CommonModule , ReactiveFormsModule , ConfirmAlertComponent , ToastsContainer],
  templateUrl: './qr.component.html',
})
export class QrComponent implements OnInit{

  toastService = inject(ToastService);

  form: FormGroup = new FormGroup({
    email: new FormControl('' , [Validators.required, Validators.email]),
    //invitorName: new FormControl('' , [Validators.required]),
  });


showAlert: boolean = false;


sendQRByEmail() {

  if(this.form.valid){
    const request: sendQRByEmailRequest = {
      email: this.form.value.email,
      invitor_name: 'Lucas Angel',
      doc_number: this.docNumber
    }

    console.log(request)
    this.qrService.sendQRByEmail(request , 1).subscribe({
      next:(data)=>{
        console.log(data)
        this.toastService.sendSuccess("El qr Ha sido enviado con exito")
       
      },
      error:(error)=>{
        console.log(error)
       this.toastService.sendError("Fallo al enviar QR, intente nuevamente...")
      }
    })
  }
}


  @Input() docNumber: number = 0;
  qrImageSrc: string = '';
 showEmailForm: boolean = false;

  constructor(private qrService: QrService) {}

  generateQr() {
    this.qrService.getQr(this.docNumber).subscribe((response) => {
      const reader = new FileReader();
      reader.readAsDataURL(response);
      reader.onloadend = () => {
        this.qrImageSrc = reader.result as string;
      };
    });
  }

  ngOnInit(): void {
    this.generateQr()
  }

  handleConfirm() {
    this.showAlert = false; // Ocultar la alerta después de confirmar
  }
}
