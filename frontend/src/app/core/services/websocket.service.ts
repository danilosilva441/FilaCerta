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
    // 1. Descobre se está usando HTTP ou HTTPS (para usar WS ou WSS)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // 2. Se for localhost, aponta para a porta do Java (8080). Se for produção, usa o domínio do Railway.
    const wsHost =
      window.location.hostname === 'localhost' ? 'localhost:8080' : window.location.host;

    // 3. Monta a URL final usando a nova rota com /api/
    const wsUrl = `${wsProtocol}//${wsHost}/api/ws-filacerta`;

    this.stompClient = new Client({
      brokerURL: wsUrl, // Usando a URL dinâmica
      reconnectDelay: 5000,

      // ... resto do seu código (onConnect, etc) fica exatamente igual

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

      onStompError: (frame: any) => {
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
