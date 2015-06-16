/*
 * x86 assembly CodeMirror mode
 * http://pasm.pis.to/js/codemirror/mode/x86/x86.js
 */
CodeMirror.defineMode('x86', function()
{
	var keywords1 = /^(add|push|pop|or|adc|sbb|and|daa|sub|das|xor|aaa|cmp|aas|inc|dec|pusha|pushad|popa|popad|bound|arpl|movsxd|imul|ins|insb|insw|insd|outs|outsb|outsw|outsd|test|xchg|mov|lea|nop|pause|cbw|cwde|cdqe|cwd|cdq|cqo|callf|fwait|wait|pushf|pushfd|pushfq|popf|popfd|popfq|sahf|lahf|movs|movsb|movsw|movsd|movsq|cmps|cmpsb|cmpsw|cmpsd|cmpsq|stos|stosb|stosw|stosd|stosq|lods|lodsb|lodsw|lodsd|lodsq|scas|scasb|scasw|scasd|scasq|rol|ror|rcl|rcr|shl|sal|shr|sar|retn|les|lds|enter|leave|retf|int|into|iret|iretd|iretq|aam|aad|salc|setalc|xlat|xlatb|fadd|fmul|fcom|fcomp|fsub|fsubr|fdiv|fdivr|fld|fxch|fst|fnop|fstp|fldenv|fchs|fabs|ftst|fxam|fldcw|fld1|fldl2t|fldl2e|fldpi|fldlg2|fldln2|fldz|fnstenv|fstenv|f2xm1|fyl2x|fptan|fpatan|fxtract|fprem1|fdecstp|fincstp|fnstcw|fstcw|fprem|fyl2xp1|fsqrt|fsincos|frndint|fscale|fsin|fcos|fiadd|fcmovb|fimul|fcmove|ficom|fcmovbe|ficomp|fcmovu|fisub|fisubr|fucompp|fidiv|fidivr|fild|fcmovnb|fisttp|fcmovne|fist|fcmovnbe|fistp|fcmovnu|fneni|feni|fndisi|fdisi|fnclex|fclex|fninit|finit|fnsetpm|fsetpm|fucomi|fcomi|ffree|frstor|fucom|fucomp|fnsave|fsave|fnstsw|fstsw|faddp|fmulp|fcompp|fsubrp|fsubp|fdivrp|fdivp|fbld|fucomip|fbstp|fcomip|in|out|call|lock|int1|icebp|repnz|repne|rep|repz|repe|hlt|cmc|not|neg|mul|div|idiv|clc|stc|cli|sti|cld|std|sldt|str|lldt|ltr|verr|verw|jmpe|sgdt|vmcall|vmlaunch|vmresume|vmxoff|sidt|monitor|mwait|lgdt|xgetbv|xsetbv|lidt|smsw|lmsw|invlpg|swapgs|rdtscp|lar|lsl|loadall|syscall|clts|sysret|invd|wbinvd|ud2|movups|movss|movupd|movhlps|movlps|movlpd|movddup|movsldup|unpcklps|unpcklpd|unpckhps|unpckhpd|movlhps|movhps|movhpd|movshdup|hint_nop|prefetchnta|prefetcht0|prefetcht1|prefetcht2|movaps|movapd|cvtpi2ps|cvtsi2ss|cvtpi2pd|cvtsi2sd|movntps|movntpd|cvttps2pi|cvttss2si|cvttpd2pi|cvttsd2si|cvtps2pi|cvtss2si|cvtpd2pi|cvtsd2si|ucomiss|ucomisd|comiss|comisd|wrmsr|rdtsc|rdmsr|rdpmc|sysenter|sysexit|getsec|pshufb|phaddw|phaddd|phaddsw|pmaddubsw|phsubw|phsubd|phsubsw|psignb|psignw|psignd|pmulhrsw|pblendvb|blendvps|blendvpd|ptest|pabsb|pabsw|pabsd|pmovsxbw|pmovsxbd|pmovsxbq|pmovsxwd|pmovsxwq|pmovsxdq|pmuldq|pcmpeqq|movntdqa|packusdw|pmovzxbw|pmovzxbd|pmovzxbq|pmovzxwd|pmovzxwq|pmovzxdq|pcmpgtq|pminsb|pminsd|pminuw|pminud|pmaxsb|pmaxsd|pmaxuw|pmaxud|pmulld|phminposuw|invept|invvpid|movbe|crc32|roundps|roundpd|roundss|roundsd|blendps|blendpd|pblendw|palignr|pextrb|pextrw|pextrd|pextrq|extractps|pinsrb|insertps|pinsrd|pinsrq|dpps|dppd|mpsadbw|pcmpestrm|pcmpestri|pcmpistrm|pcmpistri|cmovo|cmovno|cmovb|cmovnae|cmovc|cmovnb|cmovae|cmovnc|cmovz|cmove|cmovnz|cmovne|cmovbe|cmovna|cmovnbe|cmova|cmovs|cmovns|cmovp|cmovpe|cmovnp|cmovpo|cmovl|cmovnge|cmovnl|cmovge|cmovle|cmovng|cmovnle|cmovg|movmskps|movmskpd|sqrtps|sqrtss|sqrtpd|sqrtsd|rsqrtps|rsqrtss|rcpps|rcpss|andps|andpd|andnps|andnpd|orps|orpd|xorps|xorpd|addps|addss|addpd|addsd|mulps|mulss|mulpd|mulsd|cvtps2pd|cvtpd2ps|cvtss2sd|cvtsd2ss|cvtdq2ps|cvtps2dq|cvttps2dq|subps|subss|subpd|subsd|minps|minss|minpd|minsd|divps|divss|divpd|divsd|maxps|maxss|maxpd|maxsd|punpcklbw|punpcklwd|punpckldq|packsswb|pcmpgtb|pcmpgtw|pcmpgtd|packuswb|punpckhbw|punpckhwd|punpckhdq|packssdw|punpcklqdq|punpckhqdq|movd|movq|movdqa|movdqu|pshufw|pshuflw|pshufhw|pshufd|psrlw|psraw|psllw|psrld|psrad|pslld|psrlq|psrldq|psllq|pslldq|pcmpeqb|pcmpeqw|pcmpeqd|emms|vmread|vmwrite|haddpd|haddps|hsubpd|hsubps|seto|setno|setb|setnae|setc|setnb|setae|setnc|setz|sete|setnz|setne|setbe|setna|setnbe|seta|sets|setns|setp|setpe|setnp|setpo|setl|setnge|setnl|setge|setle|setng|setnle|setg|cpuid|bt|shld|rsm|bts|shrd|fxsave|fxrstor|ldmxcsr|stmxcsr|xsave|lfence|xrstor|mfence|sfence|clflush|cmpxchg|lss|btr|lfs|lgs|movzx|popcnt|btc|bsf|bsr|movsx|xadd|cmpps|cmpss|cmppd|movnti|pinsrw|shufps|shufpd|cmpxchg8b|cmpxchg16b|vmptrld|vmclear|vmxon|vmptrst|bswap|addsubpd|addsubps|paddq|pmullw|movq2dq|movdq2q|pmovmskb|psubusb|psubusw|pminub|pand|paddusb|paddusw|pmaxub|pandn|pavgb|pavgw|pmulhuw|pmulhw|cvtpd2dq|cvttpd2dq|cvtdq2pd|movntq|movntdq|psubsb|psubsw|pminsw|por|paddsb|paddsw|pmaxsw|pxor|lddqu|pmuludq|pmaddwd|psadbw|maskmovq|maskmovdqu|psubb|psubw|psubd|psubq|paddb|paddw|paddd|ret|jo|jno|jb|jnae|jc|jnb|jae|jnc|jz|je|jnz|jne|jbe|jna|jnbe|ja|js|jns|jp|jpe|jnp|jpo|jl|jnge|jnl|jge|jle|jng|jnle|jg|loopnz|loopne|loopz|loope|loop|jcxz|jecxz|jrcxz|jmp|jmpf)\b/i;
	var keywords2 = /^(call|j[pr]|ret[in]?)\b/i;
	var keywords3 = /^b_?(call|jump)\b/i;
	// var variables1 = /^(af?|bc?|c|de?|e|hl?|l|i[xy]?|r|sp)\b/i;
	// var variables2 = /^(n?[zc]|p[oe]?|m)\b/i;
	var errors = /^([hl][xy]|i[xy][hl]|slia|sll)\b/i;
	var numbers = /^([\da-f]+h|[0-9]+o|[01]+b|\d+)\b/i;
	var numbers2 = /^0x([a-f0-9]+)/i;
	var variables = /^(al|bl|cl|dl|ah|bh|ch|dh|ax|bx|cx|dx|sp|bp|si|di|eax|ebx|ecx|edx|esp|ebp|esi|edi|rax|rbx|rcx|rdx|rsp|rbp|rsi|rdi|es|cs|ss|ds|fs|gs|cr0|cr2|cr3|cr4|dr0|dr1|dr2|dr3|dr4|dr5|dr6|dr7|r8b|r9b|r10b|r11b|r12b|r13b|r14b|r15b|r8w|r9w|r10w|r11w|r12w|r13w|r14w|r15w|r8d|r9d|r10d|r11d|r12d|r13d|r14d|r15d|r8|r9|r10|r11|r12|r13|r14|r15|mm0|mm1|mm2|mm3|mm4|mm5|mm6|mm7|xmm0|xmm1|xmm2|xmm3|xmm4|xmm5|xmm6|xmm7|xmm8|xmm9|xmm10|xmm11|xmm12|xmm13|xmm14|xmm15)/i
  var labels = /^([\.0-9a-zA-Z_-]+)/i;
  var defs = /^(times|bits|org|db|dw)/i;

	return {startState: function()
	{
		return {context: 0};
	}, token: function(stream, state)
	{
		if (!stream.column())
			state.context = 0;

		if (stream.eatSpace())
			return null;

		var w;

		if (stream.eatWhile(/\w/))
		{
			w = stream.current();
			if (defs.test(w))
			{
				return '';
			}
			if (stream.indentation())
			{
				if (state.context == 1 && variables.test(w))
					return 'variable-2';
				// if (state.context == 2 && variables2.test(w))
				// 	return 'variable-3';
				if (keywords1.test(w))
				{
					state.context = 1;
					return 'keyword';
				}
				else if (keywords2.test(w))
				{
					state.context = 2;
					return 'keyword';
				}
				else if (keywords3.test(w))
				{
					state.context = 3;
					return 'keyword';
				}
				if (errors.test(w))
					return 'error';
				if (numbers2.test(w))
				{
					return 'number';
				}
			}
			else if (keywords1.test(w))
			{
				state.context = 1;
				return 'keyword';
			}
			else if (numbers.test(w))
			{
				return 'number';
			}
			else if (numbers2.test(w))
			{
				return 'number';
			}
			else if (labels.test(w))
			{
				return 'variable';
			}
			else
			{
				return null;
			}
		}
		else if (stream.eat(';'))
		{
			stream.skipToEnd();
			return 'comment';
		}
		else if (stream.eat('"'))
		{
			while (w = stream.next())
			{
				if (w == '"')
					break;
				if (w == '\\')
					stream.next();
			}

			return 'string';
		}

		else if (stream.eat('\''))
		{
			if (stream.match(/\\?.'/))
				return 'number';
		}
		else if (stream.eat('.') || stream.sol() && stream.eat('#'))
		{
			state.context = 4;

			if (stream.eatWhile(/\w/))
				return 'def';
		}
		else if (stream.eat('$'))
		{
			if (stream.eatWhile(/[\da-f]/i))
				return 'number';
		}
		else if (stream.eat('%'))
		{
			if (stream.eatWhile(/[01]/))
				return 'number';
		}
		else
		{
			stream.next();
		}

		return null;
	}};
});

CodeMirror.defineMIME("text/x-x86", "x86");
