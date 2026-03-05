import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Table, Pagination, Alert, Modal, Form } from 'react-bootstrap';

function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertVariant, setAlertVariant] = useState('success');

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', description: '' });

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage]);

    const fetchProducts = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products?page=${page}`);
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
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/sync-products`);
            displayAlert('Products synced successfully!', 'success');
            fetchProducts(currentPage);
        } catch (err) {
            displayAlert('Failed to sync products.', 'danger');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setLoading(true);
            try {
                await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
                displayAlert('Product deleted successfully!', 'success');
                fetchProducts(currentPage);
            } catch (err) {
                displayAlert('Failed to delete product.', 'danger');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
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
        setLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/products/${editingProduct.id}`, editingProduct);
            displayAlert('Product updated successfully!', 'success');
            handleCloseEditModal();
            fetchProducts(currentPage);
        } catch (err) {
            displayAlert('Failed to update product.', 'danger');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async () => {
        setLoading(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/products`, newProduct);
            displayAlert('Product created successfully!', 'success');
            setShowCreateModal(false);
            setNewProduct({ name: '', price: '', stock: '', description: '' });
            fetchProducts(currentPage);
        } catch (err) {
            displayAlert('Failed to create product.', 'danger');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const displayAlert = (message, variant = 'success') => {
        setAlertMessage(message);
        setAlertVariant(variant);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    if (loading) return <Container className="mt-4">Loading products...</Container>;
    if (error) return <Container className="mt-4"><Alert variant="danger">Error: {error.message}</Alert></Container>;

    return (
        <Container className="mt-4">
            {showAlert && (
                <Alert variant={alertVariant} onClose={() => setShowAlert(false)} dismissible>
                    {alertMessage}
                </Alert>
            )}
            <h1 className="mb-4">Product Dashboard</h1>
            <Button variant="primary" onClick={handleSyncProducts} className="mb-4 me-2" disabled={loading}>
                Sync Products
            </Button>
            <Button variant="success" onClick={() => setShowCreateModal(true)} className="mb-4" disabled={loading}>
                Create Product
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
                            <td>Rp. {product.price}</td>
                            <td>{product.stock}</td>
                            <td>{product.description}</td>
                            <td className='d-flex h-100 align-items-center justify-content-center'>
                                <Button variant="info" size="sm" className="me-2" onClick={() => handleEditClick(product)} disabled={loading}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteProduct(product.id)} disabled={loading}>Delete</Button>
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
                        disabled={loading}
                    >
                        {page}
                    </Pagination.Item>
                ))}
            </Pagination>

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
                    <Button variant="primary" onClick={handleUpdateProduct} disabled={loading}>
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={newProduct.price}
                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Stock</Form.Label>
                            <Form.Control
                                type="number"
                                name="stock"
                                value={newProduct.stock}
                                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                rows={3}
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCreateProduct} disabled={loading}>
                        Create Product
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default App;
