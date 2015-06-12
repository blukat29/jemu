start:
    push ebp
    mov ebp, esp
    push 2
    push 1
    call sum
    hlt

sum:
    push ebp
    mov ebp, esp
    mov eax, [ebp+0x8]
    mov ebx, [ebp+0xc]
    add eax, ebx
    mov esp, ebp
    pop ebp
    ret
