// Captura o formulário
const form = document.getElementById("cadastroForm");
const msg = document.getElementById("mensagem");

// Ao enviar o formulário
form.addEventListener("submit", function(e){
    e.preventDefault(); // Impede recarregar a página

    // Captura dos campos
    const nome = document.getElementById("nome").value;
    const cpf = document.getElementById("cpf").value;
    const nasc = document.getElementById("nascimento").value;
    const tel = document.getElementById("telefone").value;
    const end = document.getElementById("endereco").value;

    // Cria objeto do paciente
    const paciente = {
        nome: nome,
        cpf: cpf,
        nascimento: nasc,
        telefone: tel,
        endereco: end
    };

    // Salva no localStorage (simples simulação de banco)
    let lista = JSON.parse(localStorage.getItem("pacientes")) || [];
    lista.push(paciente);
    localStorage.setItem("pacientes", JSON.stringify(lista));

    // Exibe mensagem de sucesso
    msg.style.display = "block";

    // Limpa o formulário
    form.reset();
});
