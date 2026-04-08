package com.systemWeb.DVita.Repository;
import com.systemWeb.DVita.Model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository

public interface ClienteRepository  extends JpaRepository<Long, Cliente> {
}
