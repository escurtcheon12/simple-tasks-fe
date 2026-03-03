import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Table, Pagination, Alert, Modal, Form } from 'react-bootstrap';

function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    // State for Edit Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const fetchProducts = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/products?page=${page}`);
            setProducts(response.data.data);
            setCurrentPage(response.data.current_page);
            setLastPage(response.data.last_page);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncProducts = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/api/sync-products');
            alert('Products synced successfully!');
            fetchProducts(currentPage); // Refresh products after sync
        } catch (err) {
            alert('Failed to sync products.');
            console.error(err);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
                alert('Product deleted successfully!');
                fetchProducts(currentPage); // Refresh products after deletion
            } catch (err) {
                alert('Failed to delete product.');
                console.error(err);
            }
        }
    };

    // Edit Modal Handlers
    const handleEditClick = (product) => {
        setEditingProduct({ ...product }); // Create a copy to edit
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingProduct(null);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditingProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateProduct = async () => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/products/${editingProduct.id}`, editingProduct);
            alert('Product updated successfully!');
            handleCloseEditModal();
            fetchProducts(currentPage); // Refresh products after update
        } catch (err) {
            alert('Failed to update product.');
            console.error(err);
        }
    };

    if (loading) return <Container className="mt-4">Loading products...</Container>;
    if (error) return <Container className="mt-4"><Alert variant="danger">Error: {error.message}</Alert></Container>;

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Product Dashboard</h1>
            <Button variant="primary" onClick={handleSyncProducts} className="mb-4">
                Sync Products
            </Button>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={product.id}>
                            <td>{(currentPage - 1) * 10 + index + 1}</td>
                            <td>{product.name}</td>
                            <td>${product.price}</td>
                            <td>{product.stock}</td>
                            <td>{product.description}</td>
                            <td className='d-flex h-100 align-items-center justify-content-center'>
                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEditClick(product)}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Pagination className="mt-4">
                {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                    <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </Pagination.Item>
                ))}
            </Pagination>

            {/* Edit Product Modal */}
            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingProduct && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={editingProduct.name || ''}
                                    onChange={handleEditFormChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={editingProduct.price || ''}
                                    onChange={handleEditFormChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Stock</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="stock"
                                    value={editingProduct.stock || ''}
                                    onChange={handleEditFormChange}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="description"
                                    rows={3}
                                    value={editingProduct.description || ''}
                                    onChange={handleEditFormChange}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdateProduct}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;
