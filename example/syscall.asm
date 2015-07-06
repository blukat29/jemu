mov eax, 4
mov ebx, 1
push 0x0a646c72
push 0x6f77206f
push 0x6c6c6568
mov ecx, esp
mov edx, 12
int 0x80
hlt
