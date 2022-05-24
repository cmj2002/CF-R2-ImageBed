import {handleGET,handlePOST} from './handler'

addEventListener('fetch', (event) => {
    switch (event.request.method) {
        case 'GET':
            event.respondWith(handleGET(event.request));
            break;
        case 'POST':
            event.respondWith(handlePOST(event.request));
            break;
        default:
            event.respondWith(new Response('Method not supported', {status: 405}));
    }
})
