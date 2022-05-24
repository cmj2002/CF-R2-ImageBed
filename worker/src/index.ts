import {handleGET,handlePUT} from './handler'

addEventListener('fetch', (event) => {
    switch (event.request.method) {
        case 'GET':
            event.respondWith(handleGET(event.request));
            break;
        case 'PUT':
            event.respondWith(handlePUT(event.request));
            break;
        default:
            event.respondWith(new Response('Method not supported', {status: 405}));
    }
})
