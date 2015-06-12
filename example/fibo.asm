start:
    push ebp
    mov ebp, esp
    push 6
    call fibo
    hlt

fibo:
    push ebp
    mov ebp, esp
    sub esp, 8

    mov eax, [ebp+0x8]
    cmp eax, 2
    jle fibo_base

    sub eax, 2
    mov [esp], eax
    call fibo
    mov [ebp-0x4], eax   ; v4 = fibo(a1 - 2)

    mov ebx, [ebp+0x8]
    sub ebx, 1
    mov [esp], ebx
    call fibo  ; eax = fibo(a1 - 1)

    mov ecx, [ebp-0x4]
    add eax, ecx  ; eax = eax + v4
    jmp fibo_end

fibo_base:
    mov eax, 1

fibo_end:
    mov esp, ebp
    pop ebp
    ret
