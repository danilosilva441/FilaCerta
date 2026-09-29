import { Injectable, OnDestroy } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService implements OnDestroy {
  private stompClient: Client;

  // Criamos "rádios" para os componentes sintonizarem
  private caixaSubject = new Subject<void>();
  private pedidosSubject = new Subject<void>();

  // Observables que os componentes vão escutar
  caixa$ = this.caixaSubject.asObservable();
  pedidos$ = this.pedidosSubject.asObservable();

  constructor() {
    this.stompClient = new Client({
      // Ajuste a URL se o seu Spring Boot rodar numa porta diferente
      brokerURL: 'ws://localhost:8080/ws-filacerta',

      // Tenta reconectar a cada 5 segundos se a internet cair
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('🟢 Conectado ao WebSocket com sucesso!');

        // Sintoniza no canal do Caixa/Cozinha
        this.stompClient.subscribe('/topic/caixa', (msg: Message) => {
          console.log('📢 Aviso do Caixa recebido!');
          this.caixaSubject.next();
        });

        // Sintoniza no canal de Pedidos
        this.stompClient.subscribe('/topic/pedidos', (msg: Message) => {
          console.log('🍔 Aviso de Pedido recebido!');
          this.pedidosSubject.next();
        });
      },

      onDisconnect: () => {
        console.log('🔴 Desconectado do WebSocket.');
      },

      onStompError: (frame) => {
        console.error('❌ Erro no WebSocket: ', frame.headers['message']);
      },
    });

    // Liga o motor!
    this.stompClient.activate();
  }

  ngOnDestroy(): void {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}
