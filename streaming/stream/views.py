from django.shortcuts import render, redirect

# Create your views here.
def login(request):
    if request.method == 'GET':
        return render(request, 'login.html', {})
    elif request.method == 'POST' and \
            'username' in request.POST and \
            'room-name' in request.POST:
        response = redirect(f'/{request.POST["room-name"]}/')
        response.set_cookie('username', request.POST['username'])
        response.set_cookie('room-name', request.POST['room-name'])
        return response
    return render(request, 'login.html', {})

def room(request, room_name):
    username = request.GET.get('username', 'Anonymous') 
    return render(request, 'room.html', {'room_name': room_name, 'username':username})